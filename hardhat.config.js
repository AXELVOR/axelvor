require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts,
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts,
      chainId: 97,
      gasPrice: 3_000_000_000, // 3 gwei — BSC testnet minimum tip can reject lower fees
    },
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
      accounts,
      chainId: 56,
      gasPrice: 100_000_000, // 0.1 gwei — BSC is cheap; bump if txs stall
    },
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
    },
  },
  sourcify: {
    enabled: true,
  },
};
