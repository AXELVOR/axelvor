const hre = require("hardhat");

/**
 * Usage:
 *   CONTRACT=0x... AMOUNT=100000000000 npx hardhat run scripts/fund-pool.js --network <network>
 * AMOUNT is in whole AXLV tokens (not wei).
 */
async function main() {
  const contractAddress = process.env.CONTRACT;
  const amountWhole = process.env.AMOUNT;
  if (!contractAddress || !amountWhole) {
    throw new Error("Set CONTRACT and AMOUNT env vars");
  }

  const [signer] = await hre.ethers.getSigners();
  const lucky = await hre.ethers.getContractAt("LuckyCoin", contractAddress, signer);
  const amount = hre.ethers.parseUnits(amountWhole, 18);

  console.log("Funding pool with", amountWhole, "AXLV from", signer.address);
  const tx = await lucky.fundRewardPool(amount);
  await tx.wait();
  console.log("Reward pool balance:", hre.ethers.formatUnits(await lucky.rewardPoolBalance(), 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
