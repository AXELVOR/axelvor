# Add Axelvor logo (BscScan + wallets)

Logo files are in `assets/logo/`:

- `axelvor-64.png` — BscScan
- `axelvor-256.png` — Trust Wallet / general
- `axelvor-logo.png` — master

Token: `0x2267b58e2Da335Af8650AB32ba377f016a0CAd40`

## 1) Verify contract source on BscScan (required first)

1. Open https://bscscan.com/verifyContract
2. Address: `0x2267b58e2Da335Af8650AB32ba377f016a0CAd40`
3. Compiler: `0.8.24`, Optimization **Yes**, runs `200`
4. Upload flattened source or use Hardhat verify if you have a BscScan API key

```bash
# optional if BSCSCAN_API_KEY is in .env
npx hardhat verify --network bsc 0x2267b58e2Da335Af8650AB32ba377f016a0CAd40 0x4a7Be12F71F2D3A882f4bC1a30B193fD0bf3d97C
```

(Constructor arg = your deployer/owner address.)

## 2) Claim contract ownership on BscScan

1. Create/login BscScan account
2. Profile → **Verified Address** → Add Address
3. Sign with the **deployer** MetaMask (`0x4a7Be12F71F2D3A882f4bC1a30B193fD0bf3d97C`)

## 3) Submit token logo / info

1. Go to https://bscscan.com/tokenupdate
2. Upload `assets/logo/axelvor-64.png` (or host it publicly and paste the link)
3. Fill website (axelvor.com), description, socials
4. Wait for BscScan review

## 4) Trust Wallet / MetaMask logos

Many wallets read from Trust Wallet Assets GitHub. Folder prepared at:

`assets/trustwallet/smartchain/assets/0x2267b58e2Da335Af8650AB32ba377f016a0CAd40/`

Open a PR to: https://github.com/trustwallet/assets

Until approved, MetaMask may show a generic icon even though trading works.
