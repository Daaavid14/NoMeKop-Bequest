# 🚀 NFT Minting Guide - Nomekop Bequest

## IPFS Information
- **Hash**: `bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku`
- **Total Pokémon**: 40 (IDs 0-39)
- **Format**: `ipfs://[HASH]/[ID].json`

Example: `ipfs://bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku/0.json`

---

## Method 1: UI Minting (mint.html)

### Single Mint
1. Navigate to **Mint** page
2. Click **CONNECT WALLET**
3. Fill in form:
   - **Recipient Address**: Auto-filled with your wallet
   - **Token URI**: e.g., `ipfs://bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku/0.json`
   - **Rarity**: Click badge (1=Common to 5=Legendary)
4. Click **🚀 MINT POKÉMON**
5. Approve in MetaMask

### Batch Mint (UI)
1. Go to Mint page
2. Scroll to "⚡ Batch Mint" section
3. Set Start and End Token IDs
4. Click **⚡ BATCH MINT**
5. Approve transactions as they appear

---

## Method 2: Console Commands (Fastest)

### Quick Setup
Open browser Developer Tools: **F12 or Ctrl+Shift+I**

Go to **Console** tab and run:

```javascript
// Connect wallet first
await mintTools.connect()
```

### Mint All 40 Pokémon (One Command!)
```javascript
await mintTools.quickMintAll()
```

### Mint Range
```javascript
// Mint tokens 0-10
await mintTools.batchMint(0, 10)
```

### Mint Single Token
```javascript
// Mint token #5 with rarity 4 to your address
await mintTools.mintOne(5, await signer.getAddress(), 4)
```

---

## Pokémon Rarities

| Rarity | Level | Examples |
|--------|-------|----------|
| 1 | Common | Pidgeot Mega |
| 2 | Uncommon | (Your level 2s) |
| 3 | Rare | (Your level 3s) |
| 4 | Epic | Abomasnow Mega, Aerodactyl Mega |
| 5 | Legendary | Charizard Mega Y |

---

## Troubleshooting

### "Only owner can mint"
- Only the wallet that deployed the contract can mint
- Switch to that account in MetaMask

### Transaction fails silently
- Check MetaMask for errors
- Verify you're on **Sepolia Test Network**
- Ensure you have **test ETH** for gas fees

### Metadata not loading in marketplace
- IPFS links may take time to propagate
- Wait a few minutes and refresh
- Verify IPFS link is accessible: https://ipfs.io/ipfs/[hash]/0.json

### Batch mint stops
- RPC rate limiting (too fast)
- Console version includes 3-second delays
- Try minting smaller batches

---

## Contract Addresses

- **NFT Contract**: `0xd9371a6c64d11936Dec44a8fC1a9CA3EBcA9e07c`
- **Marketplace**: `0x7F56c14911Ab4235f8f9b11F88d74a7A7D3E4727`
- **Network**: Sepolia Testnet

---

## Next Steps

1. ✅ Mint 5-10 Pokémon to test
2. ✅ View them in **Marketplace**
3. ✅ List for sale
4. ✅ Test buying/selling

Good luck, Trainer! 🎮
