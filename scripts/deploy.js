const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Axelvor with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance));

  const Axelvor = await hre.ethers.getContractFactory("Axelvor");
  const token = await Axelvor.deploy(deployer.address);
  await token.waitForDeployment();

  const address = await token.getAddress();
  const supply = await token.totalSupply();

  console.log("Axelvor deployed to:", address);
  console.log("Symbol: AXLV");
  console.log("Total supply:", hre.ethers.formatUnits(supply, 18), "AXLV");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
