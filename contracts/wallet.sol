// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Correct import paths (notice the /governance/ for some files)
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MetaNestWallet is 
    Ownable, 
    Pausable, 
    ReentrancyGuard, 
    ERC2771Context, 
    UUPSUpgradeable,
    EIP712
{
    // Custom errors
    error InvalidAddress();
    error InvalidAmount();
    error InvalidMemoLength();
    error ContactNotFound();
    error TransferFailed();
    error InsufficientBalance();
    error InvalidSignature();
    error InvalidGuardians();
    error RecoveryNotInitiated();
    error RecoveryTimeNotElapsed();
    error RecoveryAlreadyInitiated();
    error NotInRecovery();
    error InvalidBatchInput();

    // Events
    event TokenSent(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        string memo
    );
    event EthSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string memo
    );
    event EthDeposited(address indexed user, uint256 amount);
    event EthWithdrawn(address indexed user, uint256 amount);
    event ContactAdded(address indexed user, address indexed contactAddress, string name);
    event ContactUpdated(address indexed user, address indexed contactAddress, string name);
    event ContactDeleted(address indexed user, address indexed contactAddress);
    event RecoveryInitiated(address indexed user, uint256 recoveryDeadline);
    event RecoveryCompleted(address indexed oldUser, address indexed newUser);
    event BatchTransfer(address indexed sender, uint256 totalTransfers);

    // Structs
    struct Transaction {
        address token;
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    struct RecoveryInfo {
        address newOwner;
        uint256 deadline;
        uint256 guardiansApproved;
    }

    // Constants
    uint256 public constant MAX_TRANSACTIONS = 5;
    uint256 public constant MAX_MEMO_LENGTH = 128;
    uint256 public constant RECOVERY_DELAY = 3 days;
    uint256 public constant MIN_GUARDIANS = 3;
    bytes32 private constant _RECOVERY_TYPEHASH = 
        keccak256("Recovery(address oldOwner,address newOwner,uint256 deadline)");

    // Mappings
    mapping(address => mapping(address => string)) private _contacts;
    mapping(address => Transaction[MAX_TRANSACTIONS]) private _transactions;
    mapping(address => uint256) private _transactionCounters;
    mapping(address => uint256) private _ethBalances;
    mapping(address => address[]) private _guardians;
    mapping(address => RecoveryInfo) private _recoveries;

    // Trusted forwarder for meta transactions
    constructor(address trustedForwarder) 
        ERC2771Context(trustedForwarder)
        EIP712("MetaNestWallet", "1")
    {
        // Initialize the implementation (will not be used as this is UUPS)
        _disableInitializers();
    }

    // Initialize function for proxy
    function initialize(address initialOwner, address trustedForwarder) public initializer {
        __ERC2771Context_init(trustedForwarder);
        __EIP712_init("MetaNestWallet", "1");
        _transferOwnership(initialOwner);    
    }

    // Allow contract to receive ETH
    receive() external payable {
        _ethBalances[_msgSender()] += msg.value;
        emit EthDeposited(_msgSender(), msg.value);
    }

    /**
     * @notice Deposit ETH into the wallet
     */
    function depositEth() external payable {
        _ethBalances[_msgSender()] += msg.value;
        emit EthDeposited(_msgSender(), msg.value);
    }

    /**
     * @notice Withdraw ETH from the wallet
     * @param amount The amount of ETH to withdraw
     */
    function withdrawEth(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (_ethBalances[_msgSender()] < amount) revert InsufficientBalance();

        _ethBalances[_msgSender()] -= amount;
        (bool success, ) = payable(_msgSender()).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit EthWithdrawn(_msgSender(), amount);
    }

    /**
     * @notice Send ETH to another address
     * @param to The recipient address
     * @param amount The amount of ETH to send
     * @param memo A short message to attach to the transaction
     */
    function sendEth(
        address to,
        uint256 amount,
        string calldata memo
    ) external payable whenNotPaused {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (bytes(memo).length > MAX_MEMO_LENGTH) revert InvalidMemoLength();
        if (_ethBalances[_msgSender()] < amount) revert InsufficientBalance();

        _ethBalances[_msgSender()] -= amount;
        _ethBalances[to] += amount;

        _addTransaction(_msgSender(), address(0), to, amount);
        emit EthSent(_msgSender(), to, amount, memo);
    }

    /**
     * @notice Send ETH to multiple addresses in a single transaction
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send
     * @param memos Array of memos (can be empty strings)
     */
    function batchSendEth(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata memos
    ) external payable whenNotPaused {
        if (recipients.length == 0 || recipients.length != amounts.length || recipients.length != memos.length) {
            revert InvalidBatchInput();
        }

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        if (_ethBalances[_msgSender()] < totalAmount) revert InsufficientBalance();
        _ethBalances[_msgSender()] -= totalAmount;

        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert InvalidAddress();
            if (bytes(memos[i]).length > MAX_MEMO_LENGTH) revert InvalidMemoLength();

            _ethBalances[recipients[i]] += amounts[i];
            _addTransaction(_msgSender(), address(0), recipients[i], amounts[i]);
            emit EthSent(_msgSender(), recipients[i], amounts[i], memos[i]);
        }

        emit BatchTransfer(_msgSender(), recipients.length);
    }

    /**
     * @notice Get ETH balance of a user
     * @param user The user address
     * @return The ETH balance
     */
    function getEthBalance(address user) external view returns (uint256) {
        return _ethBalances[user];
    }

    /**
     * @notice Send ERC20 tokens to another address
     * @param token The token contract address
     * @param to The recipient address
     * @param amount The amount to send
     * @param memo A short message to attach to the transaction
     */
    function sendToken(
        address token,
        address to,
        uint256 amount,
        string calldata memo
    ) external whenNotPaused {
        if (token == address(0)) revert InvalidAddress();
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (bytes(memo).length > MAX_MEMO_LENGTH) revert InvalidMemoLength();

        bool success = IERC20(token).transferFrom(_msgSender(), to, amount);
        if (!success) revert TransferFailed();

        _addTransaction(_msgSender(), token, to, amount);
        emit TokenSent(_msgSender(), to, token, amount, memo);
    }

    /**
     * @notice Send ERC20 tokens to multiple addresses in a single transaction
     * @param token The token contract address
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send
     * @param memos Array of memos (can be empty strings)
     */
    function batchSendTokens(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata memos
    ) external whenNotPaused {
        if (token == address(0)) revert InvalidAddress();
        if (recipients.length == 0 || recipients.length != amounts.length || recipients.length != memos.length) {
            revert InvalidBatchInput();
        }

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            if (recipients[i] == address(0)) revert InvalidAddress();
            if (bytes(memos[i]).length > MAX_MEMO_LENGTH) revert InvalidMemoLength();
            totalAmount += amounts[i];
        }

        bool success = IERC20(token).transferFrom(_msgSender(), address(this), totalAmount);
        if (!success) revert TransferFailed();

        for (uint256 i = 0; i < recipients.length; i++) {
            success = IERC20(token).transfer(recipients[i], amounts[i]);
            if (!success) revert TransferFailed();

            _addTransaction(_msgSender(), token, recipients[i], amounts[i]);
            emit TokenSent(_msgSender(), recipients[i], token, amounts[i], memos[i]);
        }

        emit BatchTransfer(_msgSender(), recipients.length);
    }

    // Contact management functions
    function addContact(address contactAddress, string calldata name) external {
        if (contactAddress == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidMemoLength();

        _contacts[_msgSender()][contactAddress] = name;
        emit ContactAdded(_msgSender(), contactAddress, name);
    }

    function updateContact(address contactAddress, string calldata name) external {
        if (contactAddress == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidMemoLength();
        if (bytes(_contacts[_msgSender()][contactAddress]).length == 0) revert ContactNotFound();

        _contacts[_msgSender()][contactAddress] = name;
        emit ContactUpdated(_msgSender(), contactAddress, name);
    }

    function deleteContact(address contactAddress) external {
        if (bytes(_contacts[_msgSender()][contactAddress]).length == 0) revert ContactNotFound();

        delete _contacts[_msgSender()][contactAddress];
        emit ContactDeleted(_msgSender(), contactAddress);
    }

    function getContact(address user, address contactAddress) external view returns (string memory) {
        return _contacts[user][contactAddress];
    }

    // Social recovery functions
    function setGuardians(address[] calldata guardians) external {
        if (guardians.length < MIN_GUARDIANS) revert InvalidGuardians();
        
        // Check for duplicates and invalid addresses
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == address(0)) revert InvalidAddress();
            for (uint256 j = i + 1; j < guardians.length; j++) {
                if (guardians[i] == guardians[j]) revert InvalidGuardians();
            }
        }

        _guardians[_msgSender()] = guardians;
    }

    function initiateRecovery(address newOwner) external {
        if (newOwner == address(0)) revert InvalidAddress();
        if (_guardians[_msgSender()].length < MIN_GUARDIANS) revert InvalidGuardians();
        if (_recoveries[_msgSender()].deadline != 0) revert RecoveryAlreadyInitiated();

        _recoveries[_msgSender()] = RecoveryInfo({
            newOwner: newOwner,
            deadline: block.timestamp + RECOVERY_DELAY,
            guardiansApproved: 0
        });

        emit RecoveryInitiated(_msgSender(), block.timestamp + RECOVERY_DELAY);
    }

    function approveRecovery(address oldOwner, bytes calldata signature) external {
        if (_recoveries[oldOwner].deadline == 0) revert RecoveryNotInitiated();
        if (block.timestamp > _recoveries[oldOwner].deadline) revert RecoveryTimeNotElapsed();

        // Verify the guardian
        bool isGuardian = false;
        address[] storage guardians = _guardians[oldOwner];
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == _msgSender()) {
                isGuardian = true;
                break;
            }
        }
        if (!isGuardian) revert InvalidAddress();

        // Verify the signature
        bytes32 digest = _hashTypedDataV4(keccak256(
            abi.encode(
                _RECOVERY_TYPEHASH,
                oldOwner,
                _recoveries[oldOwner].newOwner,
                _recoveries[oldOwner].deadline
            )
        ));
        address signer = ECDSA.recover(digest, signature);
        if (signer != _msgSender()) revert InvalidSignature();

        _recoveries[oldOwner].guardiansApproved++;

        // Check if we have enough approvals
        uint256 requiredApprovals = (guardians.length * 2) / 3; // 2/3 majority
        if (_recoveries[oldOwner].guardiansApproved >= requiredApprovals) {
            _completeRecovery(oldOwner);
        }
    }

    function _completeRecovery(address oldOwner) private {
        address newOwner = _recoveries[oldOwner].newOwner;
        
        // Transfer ETH balance
        uint256 ethBalance = _ethBalances[oldOwner];
        if (ethBalance > 0) {
            _ethBalances[oldOwner] = 0;
            _ethBalances[newOwner] = ethBalance;
        }

        // Transfer contacts (simplified - in reality might need more complex handling)
        // Note: This is a simplified approach. In production, you might want to handle
        // contact transfer differently or let the new owner import contacts manually.

        emit RecoveryCompleted(oldOwner, newOwner);
        delete _recoveries[oldOwner];
    }

    function cancelRecovery() external {
        if (_recoveries[_msgSender()].deadline == 0) revert NotInRecovery();
        delete _recoveries[_msgSender()];
    }

    function getRecoveryStatus(address user) external view returns (RecoveryInfo memory) {
        return _recoveries[user];
    }

    function getGuardians(address user) external view returns (address[] memory) {
        return _guardians[user];
    }

    // Transaction history functions
    function getRecentTransactions(address user) external view returns (Transaction[] memory) {
        uint256 count = _transactionCounters[user] > MAX_TRANSACTIONS 
            ? MAX_TRANSACTIONS 
            : _transactionCounters[user];
        Transaction[] memory transactions = new Transaction[](count);
        
        uint256 startIndex = _transactionCounters[user] > MAX_TRANSACTIONS
            ? _transactionCounters[user] % MAX_TRANSACTIONS
            : 0;

        for (uint256 i = 0; i < count; i++) {
            uint256 index = (startIndex + i) % MAX_TRANSACTIONS;
            transactions[i] = _transactions[user][index];
        }

        return transactions;
    }

    // Admin functions
    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    // UUPS upgrade function - only owner can upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ERC2771 context overrides
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    // Internal functions
    function _addTransaction(address user, address token, address to, uint256 amount) private {
        uint256 index = _transactionCounters[user] % MAX_TRANSACTIONS;
        _transactions[user][index] = Transaction({
            token: token,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });
        _transactionCounters[user]++;
    }
}