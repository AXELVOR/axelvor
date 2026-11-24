/**
 * BSC MAINNET: deploy Axelvor → fund bonus pool → add PancakeSwap liquidity.
 *
 *   npx hardhat run scripts/mainnet-launch.js --network bsc
 */
const hre = require("hardhat");

const ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap V2
const ROUTER_ABI = [
  "function WETH() view returns (address)",
  "function factory() view returns (address)",
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) payable returns (uint amountToken,uint amountETH,uint liquidity)",
];
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
];

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;
  const bal = await provider.getBalance(signer.address);

  console.log("Network:", hre.network.name);
  console.log("Wallet:", signer.address);
  console.log("BNB:", hre.ethers.formatEther(bal));

  if (hre.network.name !== "bsc") {
    throw new Error("Refusing to run: use --network bsc");
  }
  if (bal < hre.ethers.parseEther("0.035")) {
    throw new Error("Need >= 0.035 BNB for deploy + small liquidity");
  }

  // 1) Deploy
  console.log("\n[1/3] Deploying Axelvor...");
  const Axelvor = await hre.ethers.getContractFactory("Axelvor");
  const token = await Axelvor.deploy(signer.address);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("AXLV:", tokenAddr);

  // 2) Fund bonus pool
  console.log("\n[2/3] Funding bonus pool (100B AXLV)...");
  await (await token.fundRewardPool(hre.ethers.parseUnits("100000000000", 18))).wait();
  console.log("Pool:", hre.ethers.formatUnits(await token.rewardPoolBalance(), 18));

  // 3) Add liquidity — keep leftover BNB for gas
  console.log("\n[3/3] Adding PancakeSwap liquidity...");
  const router = new hre.ethers.Contract(ROUTER, ROUTER_ABI, signer);
  const wbnb = await router.WETH();
  const tokenForLp = hre.ethers.parseUnits("10000000000", 18); // 10B AXLV
  const bnbForLp = hre.ethers.parseEther("0.025");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  await (await token.approve(ROUTER, tokenForLp)).wait();
  await (
    await router.addLiquidityETH(tokenAddr, tokenForLp, 0, 0, signer.address, deadline, {
      value: bnbForLp,
      gasLimit: 5_000_000,
    })
  ).wait();

  const factory = new hre.ethers.Contract(await router.factory(), FACTORY_ABI, provider);
  const pair = await factory.getPair(tokenAddr, wbnb);

  console.log("\n=== AXELVOR LIVE ON BSC ===");
  console.log("Token:", tokenAddr);
  console.log("Pair:", pair);
  console.log("BscScan:", `https://bscscan.com/token/${tokenAddr}`);
  console.log(
    "Trade:",
    `https://pancakeswap.finance/swap?outputCurrency=${tokenAddr}`
  );
  console.log("Remaining BNB:", hre.ethers.formatEther(await provider.getBalance(signer.address)));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
