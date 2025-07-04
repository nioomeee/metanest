// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";          
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MetaNestWallet is Ownable, Pausable, ReentrancyGuard, ERC2771Context, EIP712 {
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

    constructor(address initialOwner, address trustedForwarder) 
        ERC2771Context(trustedForwarder)
        EIP712("MetaNestWallet", "1")
        Ownable(initialOwner)
    {
        // Initial owner is the deployer
        _transferOwnership(msg.sender);
    }

    receive() external payable {
        _ethBalances[_msgSender()] += msg.value;
        emit EthDeposited(_msgSender(), msg.value);
    }

    function depositEth() external payable {
        _ethBalances[_msgSender()] += msg.value;
        emit EthDeposited(_msgSender(), msg.value);
    }

    function withdrawEth(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (_ethBalances[_msgSender()] < amount) revert InsufficientBalance();

        _ethBalances[_msgSender()] -= amount;
        (bool success, ) = payable(_msgSender()).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit EthWithdrawn(_msgSender(), amount);
    }

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

    function getEthBalance(address user) external view returns (uint256) {
        return _ethBalances[user];
    }

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

    function setGuardians(address[] calldata guardians) external {
        if (guardians.length < MIN_GUARDIANS) revert InvalidGuardians();
        
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

        bool isGuardian = false;
        address[] storage guardians = _guardians[oldOwner];
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == _msgSender()) {
                isGuardian = true;
                break;
            }
        }
        if (!isGuardian) revert InvalidAddress();

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

        uint256 requiredApprovals = (guardians.length * 2) / 3;
        if (_recoveries[oldOwner].guardiansApproved >= requiredApprovals) {
            _completeRecovery(oldOwner);
        }
    }

    function _completeRecovery(address oldOwner) private {
        address newOwner = _recoveries[oldOwner].newOwner;
        
        uint256 ethBalance = _ethBalances[oldOwner];
        if (ethBalance > 0) {
            _ethBalances[oldOwner] = 0;
            _ethBalances[newOwner] = ethBalance;
        }

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

    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

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