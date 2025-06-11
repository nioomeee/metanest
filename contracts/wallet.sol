// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MetaNestWallet is Ownable, Pausable {
     // Custom errors
    error InvalidAddress();
    error InvalidAmount();
    error InvalidMemoLength();
    error ContactNotFound();
    error TransferFailed();
    error InsufficientBalance();

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

    // Structs
    struct Transaction {
        address token;
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    // Constants
    uint256 public constant MAX_TRANSACTIONS = 5;
    uint256 public constant MAX_MEMO_LENGTH = 128;

    // Mappings
    mapping(address => mapping(address => string)) private _contacts;
    mapping(address => Transaction[MAX_TRANSACTIONS]) private _transactions;
    mapping(address => uint256) private _transactionCounters;
    mapping(address => uint256) private _ethBalances;

    constructor() {}

    // Allow contract to receive ETH
    receive() external payable {
        _ethBalances[msg.sender] += msg.value;
        emit EthDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Deposit ETH into the wallet
     */
    function depositEth() external payable {
        _ethBalances[msg.sender] += msg.value;
        emit EthDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw ETH from the wallet
     * @param amount The amount of ETH to withdraw
     */
    function withdrawEth(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (_ethBalances[msg.sender] < amount) revert InsufficientBalance();

        _ethBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit EthWithdrawn(msg.sender, amount);
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
        if (_ethBalances[msg.sender] < amount) revert InsufficientBalance();

        _ethBalances[msg.sender] -= amount;
        payable(to).transfer(amount);

        _addTransaction(msg.sender, address(0), to, amount);
        emit EthSent(msg.sender, to, amount, memo);
    }

    /**
     * @notice Get ETH balance of a user
     * @param user The user address
     * @return The ETH balance
     */
    function getEthBalance(address user) external view returns (uint256) {
        return _ethBalances[user];
    }

    function sendToken(
        address token,
        address to,
        uint256 amount,
        string calldata memo
    ) external whenNotPaused {
        if (token == address(0) || to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (bytes(memo).length > MAX_MEMO_LENGTH) revert InvalidMemoLength();

        try IERC20(token).transferFrom(msg.sender, to, amount) {
            _addTransaction(msg.sender, token, to, amount);
            emit TokenSent(msg.sender, to, token, amount, memo);
        } catch {
            revert TransferFailed();
        }


        _addTransaction(msg.sender, token, to, amount);
        emit TokenSent(msg.sender, to, token, amount, memo);
    }

    function addContact(address contactAddress, string calldata name) external {
        if (contactAddress == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidMemoLength();

        _contacts[msg.sender][contactAddress] = name;
        emit ContactAdded(msg.sender, contactAddress, name);
    }

    function updateContact(address contactAddress, string calldata name) external {
        if (contactAddress == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidMemoLength();
        if (bytes(_contacts[msg.sender][contactAddress]).length == 0) revert ContactNotFound();

        _contacts[msg.sender][contactAddress] = name;
        emit ContactUpdated(msg.sender, contactAddress, name);
    }

    function deleteContact(address contactAddress) external {
        if (bytes(_contacts[msg.sender][contactAddress]).length == 0) revert ContactNotFound();

        delete _contacts[msg.sender][contactAddress];
        emit ContactDeleted(msg.sender, contactAddress);
    }

    function getContact(address user, address contactAddress) external view returns (string memory) {
        return _contacts[user][contactAddress];
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