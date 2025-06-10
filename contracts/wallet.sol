// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MetaNestWallet
 * @dev A secure, gas-efficient cross-chain wallet contract with contact management and transaction history
 */
contract MetaNestWallet is Ownable, Pausable {
    // Custom errors
    error InvalidAddress();
    error InvalidAmount();
    error InvalidMemoLength();
    error MaxContactsReached();
    error ContactNotFound();
    error TransferFailed();

    // Events
    event TokenSent(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        string memo
    );
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
    mapping(address => mapping(address => string)) private _contacts; // user => (contactAddress => name)
    mapping(address => Transaction[MAX_TRANSACTIONS]) private _transactions; // user => transaction array
    mapping(address => uint256) private _transactionCounters; // user => next transaction index

    /**
     * @dev Initializes the contract setting the deployer as the initial owner
     */
    constructor(){}

    /**
     * @notice Send ERC20 tokens to another address with a memo
     * @param token The ERC20 token contract address
     * @param to The recipient address
     * @param amount The amount of tokens to send
     * @param memo A short message to attach to the transaction
     */
    function sendToken(
        address token,
        address to,
        uint256 amount,
        string calldata memo
    ) external whenNotPaused {
        if (token == address(0) || to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (bytes(memo).length > MAX_MEMO_LENGTH) revert InvalidMemoLength();

        // Transfer tokens from sender to recipient
        bool success = IERC20(token).transferFrom(msg.sender, to, amount);
        if (!success) revert TransferFailed();

        // Record transaction
        _addTransaction(msg.sender, token, to, amount);

        // Emit event with memo
        emit TokenSent(msg.sender, to, token, amount, memo);
    }

    /**
     * @notice Add a new contact to the user's address book
     * @param contactAddress The address to add
     * @param name The display name for the contact
     */
    function addContact(address contactAddress, string calldata name) external {
        if (contactAddress == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidMemoLength();

        _contacts[msg.sender][contactAddress] = name;
        emit ContactAdded(msg.sender, contactAddress, name);
    }

    /**
     * @notice Update an existing contact in the user's address book
     * @param contactAddress The address to update
     * @param name The new display name for the contact
     */
    function updateContact(address contactAddress, string calldata name) external {
        if (contactAddress == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidMemoLength();
        if (bytes(_contacts[msg.sender][contactAddress]).length == 0) revert ContactNotFound();

        _contacts[msg.sender][contactAddress] = name;
        emit ContactUpdated(msg.sender, contactAddress, name);
    }

    /**
     * @notice Remove a contact from the user's address book
     * @param contactAddress The address to remove
     */
    function deleteContact(address contactAddress) external {
        if (bytes(_contacts[msg.sender][contactAddress]).length == 0) revert ContactNotFound();

        delete _contacts[msg.sender][contactAddress];
        emit ContactDeleted(msg.sender, contactAddress);
    }

    /**
     * @notice Get a contact's name from the user's address book
     * @param user The user whose contact to retrieve
     * @param contactAddress The contact address to look up
     * @return The name associated with the contact address
     */
    function getContact(address user, address contactAddress) external view returns (string memory) {
        return _contacts[user][contactAddress];
    }

    /**
     * @notice Get the user's recent transactions
     * @param user The user whose transactions to retrieve
     * @return An array of Transaction structs
     */
    function getRecentTransactions(address user) external view returns (Transaction[] memory) {
        uint256 count = _transactionCounters[user] > MAX_TRANSACTIONS ? MAX_TRANSACTIONS : _transactionCounters[user];
        Transaction[] memory transactions = new Transaction[](count);
        
        uint256 startIndex;
        if (_transactionCounters[user] > MAX_TRANSACTIONS) {
            startIndex = _transactionCounters[user] % MAX_TRANSACTIONS;
        }

        for (uint256 i = 0; i < count; i++) {
            uint256 index = (startIndex + i) % MAX_TRANSACTIONS;
            transactions[i] = _transactions[user][index];
        }

        return transactions;
    }

    /**
     * @notice Toggle the paused state of the contract (admin only)
     */
    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    /**
     * @dev Internal function to add a transaction to the user's history
     * @param user The user making the transaction
     * @param token The token address
     * @param to The recipient address
     * @param amount The amount transferred
     */
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