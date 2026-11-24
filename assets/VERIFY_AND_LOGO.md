# Verify Axelvor + submit logo (do these in your browser)

Token: `0x2267b58e2Da335Af8650AB32ba377f016a0CAd40`  
Deployer (sign with this): `0x4a7Be12F71F2D3A882f4bC1a30B193fD0bf3d97C`

## A) Verify contract on BscScan

1. Open https://bscscan.com/verifyContract  
2. Fill:
   - Address: `0x2267b58e2Da335Af8650AB32ba377f016a0CAd40`
   - Compiler type: **Solidity (Single file)**
   - Compiler: **v0.8.24+commit.e11b9ed9**
   - License: **MIT**
   - Agree → Continue
3. On next page:
   - Optimization: **Yes**, runs: **200**
   - Paste full contents of `assets/Axelvor.flattened.sol`
   - Constructor arguments (ABI-encoded, **no 0x**):
     ```
     0000000000000000000000004a7be12f71f2d3a882f4bc1a30b193fd0bf3d97c
     ```
4. Verify & Publish

### Or verify with API key (faster)

1. Create free key: https://bscscan.com/myapikey  
2. Add to `.env`: `BSCSCAN_API_KEY=your_key`  
3. Run:
   ```bash
   npx hardhat verify --network bsc 0x2267b58e2Da335Af8650AB32ba377f016a0CAd40 0x4a7Be12F71F2D3A882f4bC1a30B193fD0bf3d97C
   ```

## B) Claim ownership

1. BscScan account → **Verified Address** → Add Address  
2. Sign with deployer MetaMask  
3. Click **Update Token Information**

## C) Submit logo

1. https://bscscan.com/tokenupdate  
2. Upload `assets/logo/axelvor-64.png`  
3. Website: https://axelvor.com (register if needed)  
4. Submit and wait for review  

Files ready:
- `assets/Axelvor.flattened.sol`
- `assets/logo/axelvor-64.png`
- `assets/logo/axelvor-256.png`
