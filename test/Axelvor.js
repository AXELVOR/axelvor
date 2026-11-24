const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Axelvor", function () {
  const BONUS = ethers.parseUnits("1000", 18);

  async function deploy() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Axelvor = await ethers.getContractFactory("Axelvor");
    const token = await Axelvor.deploy(owner.address);
    await token.waitForDeployment();
    return { token, owner, alice, bob };
  }

  it("mints 1 trillion Axelvor to owner", async function () {
    const { token, owner } = await deploy();
    expect(await token.name()).to.equal("Axelvor");
    expect(await token.symbol()).to.equal("AXLV");
    expect(await token.balanceOf(owner.address)).to.equal(await token.MAX_SUPPLY());
  });

  it("pays 1000 AXLV after 30 continuous days", async function () {
    const { token, alice } = await deploy();
    await token.transfer(alice.address, ethers.parseUnits("10", 18));
    await token.fundRewardPool(ethers.parseUnits("100000", 18));

    expect(await token.pendingBonus(alice.address)).to.equal(0);
    await expect(token.connect(alice).claimBonus()).to.be.revertedWith("nothing to claim");

    await time.increase(30 * 24 * 60 * 60);

    expect(await token.pendingBonus(alice.address)).to.equal(BONUS);
    const before = await token.balanceOf(alice.address);
    await expect(token.connect(alice).claimBonus())
      .to.emit(token, "BonusClaimed")
      .withArgs(alice.address, 1, BONUS);
    expect(await token.balanceOf(alice.address)).to.equal(before + BONUS);
  });

  it("pays another 1000 for a second continuous month", async function () {
    const { token, alice } = await deploy();
    await token.transfer(alice.address, ethers.parseUnits("10", 18));
    await token.fundRewardPool(ethers.parseUnits("100000", 18));

    await time.increase(60 * 24 * 60 * 60); // 2 months
    expect(await token.pendingBonus(alice.address)).to.equal(BONUS * 2n);

    await token.connect(alice).claimBonus();
    expect(await token.pendingBonus(alice.address)).to.equal(0);

    await time.increase(30 * 24 * 60 * 60);
    expect(await token.pendingBonus(alice.address)).to.equal(BONUS);
    await token.connect(alice).claimBonus();
  });

  it("resets hold streak when balance hits zero", async function () {
    const { token, owner, alice } = await deploy();
    const amt = ethers.parseUnits("10", 18);
    await token.transfer(alice.address, amt);
    await token.fundRewardPool(ethers.parseUnits("100000", 18));

    await time.increase(30 * 24 * 60 * 60);
    await token.connect(alice).claimBonus();

    await token.connect(alice).transfer(owner.address, await token.balanceOf(alice.address));
    expect(await token.holdStartedAt(alice.address)).to.equal(0);

    await token.transfer(alice.address, amt);
    await time.increase(29 * 24 * 60 * 60);
    expect(await token.pendingBonus(alice.address)).to.equal(0);
  });

  it("reverts when pool is empty", async function () {
    const { token, alice } = await deploy();
    await token.transfer(alice.address, ethers.parseUnits("10", 18));
    await time.increase(30 * 24 * 60 * 60);
    await expect(token.connect(alice).claimBonus()).to.be.revertedWith("empty pool");
  });
});
