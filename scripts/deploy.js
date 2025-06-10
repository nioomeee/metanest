const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaNestWallet", function () {
  let MetaNestWallet;
  let wallet;
  let owner;
  let user1;
  let user2;
  let mockERC20;

  before(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000"));
    await mockERC20.waitForDeployment();

    // Deploy MetaNestWallet
    MetaNestWallet = await ethers.getContractFactory("MetaNestWallet");
    wallet = await MetaNestWallet.deploy();
    await wallet.waitForDeployment();

    // Transfer some tokens to user1 for testing
    await mockERC20.transfer(user1.address, ethers.parseEther("100"));
  });

  describe("Token Send Functionality", function () {
    it("Should send tokens with memo", async function () {
      const amount = ethers.parseEther("10");
      const memo = "Test transfer";

      // Approve wallet to spend tokens
      await mockERC20.connect(user1).approve(wallet.target, amount);

      // Send tokens
      await expect(wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, memo))
        .to.emit(wallet, "TokenSent")
        .withArgs(user1.address, user2.address, mockERC20.target, amount, memo);

      // Check token balance
      expect(await mockERC20.balanceOf(user2.address)).to.equal(amount);
    });

    it("Should revert when contract is paused", async function () {
      await wallet.connect(owner).togglePause();
      
      const amount = ethers.parseEther("10");
      const memo = "Test transfer";
      await mockERC20.connect(user1).approve(wallet.target, amount);

      await expect(wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, memo))
        .to.be.revertedWithCustomError(wallet, "EnforcedPause");

      // Unpause for other tests
      await wallet.connect(owner).togglePause();
    });
  });

  describe("Contact Management", function () {
    it("Should add, update, and delete contacts", async function () {
      // Add contact
      await expect(wallet.connect(user1).addContact(user2.address, "Test Contact"))
        .to.emit(wallet, "ContactAdded")
        .withArgs(user1.address, user2.address, "Test Contact");

      // Verify contact
      expect(await wallet.getContact(user1.address, user2.address)).to.equal("Test Contact");

      // Update contact
      await expect(wallet.connect(user1).updateContact(user2.address, "Updated Contact"))
        .to.emit(wallet, "ContactUpdated")
        .withArgs(user1.address, user2.address, "Updated Contact");

      // Verify update
      expect(await wallet.getContact(user1.address, user2.address)).to.equal("Updated Contact");

      // Delete contact
      await expect(wallet.connect(user1).deleteContact(user2.address))
        .to.emit(wallet, "ContactDeleted")
        .withArgs(user1.address, user2.address);

      // Verify deletion
      expect(await wallet.getContact(user1.address, user2.address)).to.equal("");
    });
  });

  describe("Transaction History", function () {
    it("Should maintain last 5 transactions", async function () {
      const amount = ethers.parseEther("1");
      await mockERC20.connect(user1).approve(wallet.target, amount.mul(6));

      // Make 6 transactions
      for (let i = 0; i < 6; i++) {
        await wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, `Tx ${i}`);
      }

      // Get recent transactions
      const txs = await wallet.getRecentTransactions(user1.address);
      
      // Should only keep last 5
      expect(txs.length).to.equal(5);
      
      // Oldest transaction (Tx 0) should be overwritten
      expect(txs[0].amount).to.equal(amount);
      expect(txs[0].memo).to.equal("Tx 1"); // First tx should now be the second one
    });
  });

  describe("Admin Functions", function () {
    it("Should only allow owner to pause", async function () {
      await expect(wallet.connect(user1).togglePause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});