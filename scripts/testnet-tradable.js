/**
 * Deploy Axelvor on BSC testnet, fund bonus pool, add PancakeSwap liquidity, buy+sell.
 *
 *   npx hardhat run scripts/testnet-tradable.js --network bscTestnet
 */
const hre = require("hardhat");

const ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
const ROUTER_ABI = [
  "function WETH() view returns (address)",
  "function factory() view returns (address)",
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) payable returns (uint amountToken,uint amountETH,uint liquidity)",
  "function swapExactETHForTokens(uint amountOutMin,address[] calldata path,address to,uint deadline) payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) returns (uint[] memory amounts)",
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
  console.log("tBNB balance:", hre.ethers.formatEther(bal));

  if (bal < hre.ethers.parseEther("0.025")) {
    throw new Error("Need >= 0.025 tBNB. Faucet to: " + signer.address);
  }

  console.log("\n[1/5] Deploying Axelvor (1000 AXLV / month hold bonus)...");
  const Axelvor = await hre.ethers.getContractFactory("Axelvor");
  const token = await Axelvor.deploy(signer.address);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("AXLV:", tokenAddr);

  console.log("\n[2/5] Funding bonus pool (100B AXLV)...");
  const poolAmount = hre.ethers.parseUnits("100000000000", 18);
  await (await token.fundRewardPool(poolAmount)).wait();
  console.log("Pool:", hre.ethers.formatUnits(await token.rewardPoolBalance(), 18), "AXLV");

  console.log("\n[3/5] Adding PancakeSwap liquidity...");
  const router = new hre.ethers.Contract(ROUTER, ROUTER_ABI, signer);
  const wbnb = await router.WETH();
  const tokenForLp = hre.ethers.parseUnits("1000000000", 18);
  const bnbForLp = hre.ethers.parseEther("0.01");
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
  console.log("Pair:", pair);

  console.log("\n[4/5] Test BUY...");
  await (
    await router.swapExactETHForTokens(0, [wbnb, tokenAddr], signer.address, deadline, {
      value: hre.ethers.parseEther("0.0003"),
      gasLimit: 5_000_000,
    })
  ).wait();
  console.log("Buy ok");

  console.log("\n[5/5] Test SELL...");
  const sellAmount = hre.ethers.parseUnits("1000000", 18);
  await (await token.approve(ROUTER, sellAmount)).wait();
  const sellTx = await router.swapExactTokensForETH(
    sellAmount,
    0,
    [tokenAddr, wbnb],
    signer.address,
    deadline,
    { gasLimit: 5_000_000 }
  );
  await sellTx.wait();
  console.log("Sell ok:", sellTx.hash);

  console.log("\n=== AXELVOR v2 TESTNET SUCCESS ===");
  console.log("Token:", tokenAddr);
  console.log("Pair:", pair);
  console.log("BscScan:", `https://testnet.bscscan.com/token/${tokenAddr}`);
  console.log("Claim: holders call claimBonus() after 30 continuous days → 1000 AXLV");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
