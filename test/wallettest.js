const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaNestWallet", function () {
  let wallet;
  let owner;
  let user1;
  let user2;
  let mockERC20;

  before(async function () {
    [owner, user1, user2, trustedForwarder] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000"));
    await mockERC20.waitForDeployment();

    const MetaNestWallet = await ethers.getContractFactory("MetaNestWallet");
    wallet = await MetaNestWallet.deploy(owner.address, trustedForwarder.address);
    await wallet.waitForDeployment();

    await mockERC20.transfer(user1.address, ethers.parseEther("100"));
    await mockERC20.transfer(user2.address, ethers.parseEther("100"));
  });

  describe("Ownership", function () {
    it("Should set the right owner", async function () {
      expect(await wallet.owner()).to.equal(owner.address);
    });

    it("Should not allow non-owners to toggle pause", async function () {
    await expect(wallet.connect(user1).togglePause())
        .to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
    });


  });

  describe("Pausable", function () {
    afterEach(async function () {
      // Ensure contract is unpaused after each test
      if (await wallet.paused()) {
        await wallet.connect(owner).togglePause();
      }
    });

    it("Should allow owner to pause and unpause", async function () {
      await wallet.connect(owner).togglePause();
      expect(await wallet.paused()).to.be.true;

      await wallet.connect(owner).togglePause();
      expect(await wallet.paused()).to.be.false;
    });

    it("Should prevent token transfers when paused", async function () {
    await wallet.connect(owner).togglePause();
    const amount = ethers.parseEther("10");
    const memo = "Test transfer";
    await mockERC20.connect(user1).approve(wallet.target, amount);

    await expect(wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, memo))
        .to.be.revertedWithCustomError(wallet, "EnforcedPause");
});
  });

  describe("Token Transfer Functionality", function () {
    it("Should transfer tokens successfully", async function () {
      const amount = ethers.parseEther("10");
      const memo = "Test transfer";

      const beforeBalance = await mockERC20.balanceOf(user2.address);

      await mockERC20.connect(user1).approve(wallet.target, amount);

      await expect(wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, memo))
        .to.emit(wallet, "TokenSent")
        .withArgs(user1.address, user2.address, mockERC20.target, amount, memo);

        const afterBalance = await mockERC20.balanceOf(user2.address);
        expect(afterBalance - beforeBalance).to.equal(amount);
      });

    it("Should revert with invalid token address", async function () {
      const amount = ethers.parseEther("10");
      const memo = "Test transfer";
      await mockERC20.connect(user1).approve(wallet.target, amount);

      await expect(wallet.connect(user1).sendToken(ethers.ZeroAddress, user2.address, amount, memo))
        .to.be.revertedWithCustomError(wallet, "InvalidAddress");
    });

    it("Should revert with invalid recipient address", async function () {
      const amount = ethers.parseEther("10");
      const memo = "Test transfer";
      await mockERC20.connect(user1).approve(wallet.target, amount);

      await expect(wallet.connect(user1).sendToken(mockERC20.target, ethers.ZeroAddress, amount, memo))
        .to.be.revertedWithCustomError(wallet, "InvalidAddress");
    });

    it("Should revert with zero amount", async function () {
      const memo = "Test transfer";
      await mockERC20.connect(user1).approve(wallet.target, ethers.parseEther("10"));

      await expect(wallet.connect(user1).sendToken(mockERC20.target, user2.address, 0, memo))
        .to.be.revertedWithCustomError(wallet, "InvalidAmount");
    });

    it("Should revert with memo too long", async function () {
      const amount = ethers.parseEther("10");
      const longMemo = "a".repeat(129);
      await mockERC20.connect(user1).approve(wallet.target, amount);

      await expect(wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, longMemo))
        .to.be.revertedWithCustomError(wallet, "InvalidMemoLength");
    });

    it("Should revert when transfer fails", async function () {
    const amount = ethers.parseEther("1000");
    const memo = "Test transfer";
    await mockERC20.connect(user1).approve(wallet.target, amount);

    await expect(
        wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, memo)
    ).to.be.revertedWithCustomError(wallet, "TransferFailed");
});
  });

  describe("Contact Management", function () {
    it("Should not allow updating non-existent contact", async function () {
      await expect(wallet.connect(user1).updateContact(user2.address, "New Name"))
        .to.be.revertedWithCustomError(wallet, "ContactNotFound");
    });

    // ... (keep other contact management tests the same)
  });

  describe("Transaction History", function () {
    it("Should record transactions correctly", async function () {
      const amount = ethers.parseEther("1");

      const MetaNestWallet = await ethers.getContractFactory("MetaNestWallet");
      const freshWallet = await MetaNestWallet.deploy(owner.address, trustedForwarder.address);
      await freshWallet.waitForDeployment();

      await mockERC20.connect(user1).approve(freshWallet.target, amount * 5n);

      for (let i = 0; i < 5; i++) {
        await freshWallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, `Tx ${i}`);
      }

      const txs = await freshWallet.getRecentTransactions(user1.address);
      expect(txs.length).to.equal(5);
      expect(txs[0].amount).to.equal(amount);
    });

    it("Should maintain only last 5 transactions", async function () {
      const amount = ethers.parseEther("1");
      await mockERC20.connect(user1).approve(wallet.target, amount * 6n);

      for (let i = 0; i < 6; i++) {
        await wallet.connect(user1).sendToken(mockERC20.target, user2.address, amount, `Tx ${i}`);
      }

      const txs = await wallet.getRecentTransactions(user1.address);
      expect(txs.length).to.equal(5);
    });

    it("Should keep transaction history separate between users", async function () {
    const amount = ethers.parseEther("1");
    
    const MetaNestWallet = await ethers.getContractFactory("MetaNestWallet");
    const isolatedWallet = await MetaNestWallet.deploy(owner.address, trustedForwarder.address);
    await isolatedWallet.waitForDeployment();
    
    // Fund users
    await mockERC20.transfer(user1.address, amount);
    await mockERC20.transfer(user2.address, amount);
    
    // Approvals
    await mockERC20.connect(user1).approve(isolatedWallet.target, amount);
    await mockERC20.connect(user2).approve(isolatedWallet.target, amount);
    
    // Send txs (2 per user)
    await isolatedWallet.connect(user1).sendToken(mockERC20.target, user2.address, amount/2n, "User1 Tx1");
    await isolatedWallet.connect(user1).sendToken(mockERC20.target, user2.address, amount/2n, "User1 Tx2");
    await isolatedWallet.connect(user2).sendToken(mockERC20.target, user1.address, amount/2n, "User2 Tx1");
    await isolatedWallet.connect(user2).sendToken(mockERC20.target, user1.address, amount/2n, "User2 Tx2");
    
    const user1Txs = await isolatedWallet.getRecentTransactions(user1.address);
    const user2Txs = await isolatedWallet.getRecentTransactions(user2.address);
    
    expect(user1Txs.length).to.equal(2);
    expect(user2Txs.length).to.equal(2);
    });    

    describe("ETH Functionality", function () {

      beforeEach(async () => {
        const MetaNestWallet = await ethers.getContractFactory("MetaNestWallet");
        wallet = await MetaNestWallet.deploy(owner.address, trustedForwarder.address);
        await wallet.waitForDeployment();
      });

      it("Should deposit and track ETH balance", async function () {
          const depositAmount = ethers.parseEther("1");
          
          // Deposit via direct transfer
          await user1.sendTransaction({
              to: wallet.target,
              value: depositAmount
          });
          expect(await wallet.getEthBalance(user1.address)).to.equal(depositAmount);
  
          // Deposit via deposit function
          const depositAmount2 = ethers.parseEther("0.5");
          await wallet.connect(user1).depositEth({ value: depositAmount2 });
          expect(await wallet.getEthBalance(user1.address)).to.equal(depositAmount + depositAmount2);
      });
  

      it("Should withdraw ETH", async function () {
        const depositAmount = ethers.parseEther("1");
        await wallet.connect(user1).depositEth({ value: depositAmount });

        const withdrawAmount = ethers.parseEther("0.3");
        const initialBalance = await ethers.provider.getBalance(user1.address);
        
        const tx = await wallet.connect(user1).withdrawEth(withdrawAmount);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * tx.gasPrice;
        
        const finalBalance = await ethers.provider.getBalance(user1.address);
        expect(finalBalance).to.equal(initialBalance + withdrawAmount - gasUsed);
        
        expect(await wallet.getEthBalance(user1.address)).to.equal(depositAmount - withdrawAmount);
    });

    it("Should send ETH to another address", async function () {
      const depositAmount = ethers.parseEther("1");
      await wallet.connect(user1).depositEth({ value: depositAmount });

      const sendAmount = ethers.parseEther("0.2");
      const memo = "Test ETH transfer";
      
      await wallet.connect(user1).sendEth(user2.address, sendAmount, memo);
      
      // Verify balances
      expect(await wallet.getEthBalance(user1.address)).to.equal(depositAmount - sendAmount);
      expect(await wallet.getEthBalance(user2.address)).to.equal(sendAmount);

      // Verify transaction history
      const txs = await wallet.getRecentTransactions(user1.address);
      expect(txs[0].token).to.equal(ethers.ZeroAddress);
      expect(txs[0].to).to.equal(user2.address);
      expect(txs[0].amount).to.equal(sendAmount);
  });

  it("Should revert ETH operations with insufficient balance", async function () {
    const smallAmount = ethers.parseEther("0.1");
    await wallet.connect(user1).depositEth({ value: smallAmount });

    // Test withdraw with insufficient balance
    await expect(
        wallet.connect(user1).withdrawEth(smallAmount + 1n)
    ).to.be.revertedWithCustomError(wallet, "InsufficientBalance");

    // Test send with insufficient balance
    await expect(
        wallet.connect(user1).sendEth(user2.address, smallAmount + 1n, "test")
    ).to.be.revertedWithCustomError(wallet, "InsufficientBalance");
});

    it("Should prevent ETH transfers when paused", async function () {
    const depositAmount = ethers.parseEther("1");
    await wallet.connect(user1).depositEth({ value: depositAmount });

    await wallet.connect(owner).togglePause();

    await expect(
        wallet.connect(user1).sendEth(user2.address, ethers.parseEther("0.1"), "test")
    ).to.be.revertedWithCustomError(wallet, "EnforcedPause");
    });
    });
  });
});