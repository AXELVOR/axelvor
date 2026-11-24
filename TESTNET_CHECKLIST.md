# Axelvor — testnet tradability checklist

Goal: prove AXLV **deploys, holds, and buys/sells** on BSC testnet before spending real money.

## 1) Get free tBNB (required once)

Your MetaMask wallet:

`0x0ae713A2182855058FE180ddBAb5dD08243F38a0`

Claim **at least 0.15 tBNB** (best $0 options first):

1. **Telegram (no mainnet BNB needed):** message [@bnbchain_official_bot](https://t.me/bnbchain_official_bot)  
   Example: `I would like to get tBNB to my wallet 0x0ae713A2182855058FE180ddBAb5dD08243F38a0`
2. https://www.bnbchain.org/en/testnet-faucet (often asks for a tiny mainnet BNB balance)
3. https://faucet.quicknode.com/binance-smart-chain/bnb-testnet

Then reply **“funded”** here — I’ll run the full deploy + buy/sell test.

## 2) One-command full test

```bash
npx hardhat run scripts/testnet-tradable.js --network bscTestnet
```

This will:

1. Deploy Axelvor  
2. Fund the monthly reward pool  
3. Create a PancakeSwap pool (AXLV + tBNB)  
4. Execute a **buy** swap  
5. Execute a **sell** swap  

## 3) Manual trade in browser (optional)

1. MetaMask → add **BNB Smart Chain Testnet** (chainId `97`)  
2. Import the same test wallet (private key from `.env`) **or** send yourself some AXLV  
3. Open PancakeSwap testnet UI and paste the token address from the script output  
4. Swap tBNB ↔ AXLV  

## 4) Pass criteria

- [ ] Contract visible on https://testnet.bscscan.com  
- [ ] Script finishes without revert  
- [ ] Buy + sell both succeed  
- [ ] Pair address exists  

Only after that: repeat on **BSC mainnet** with real BNB (~$50–100 recommended).
