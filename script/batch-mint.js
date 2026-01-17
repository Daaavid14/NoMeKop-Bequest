// ========================================
// Batch Minting Helper for IPFS Metadata
// ========================================

const IPFS_METADATA_HASHES = {
  0: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  1: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  2: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  3: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  4: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  5: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  6: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  7: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  8: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  9: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  10: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  11: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  12: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  13: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  14: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  15: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  16: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  17: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  18: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  19: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  20: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  21: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  22: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  23: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  24: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  25: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  26: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  27: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  28: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  29: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  30: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  31: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  32: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  33: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  34: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  35: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  36: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  37: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  38: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
  39: "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku",
};

const POKEMON_DATA = [
  { id: 0, name: "Abomasnow Mega", rarity: 4, hp: 490 },
  { id: 1, name: "Aerodactyl Mega", rarity: 4, hp: 320 },
  { id: 2, name: "Aggron Mega", rarity: 4, hp: 320 },
  { id: 3, name: "Alakazam Mega", rarity: 5, hp: 132 },
  { id: 4, name: "Altaria Mega", rarity: 3, hp: 210 },
  { id: 5, name: "Banette Mega", rarity: 2, hp: 153 },
  { id: 6, name: "Beedrill Mega", rarity: 3, hp: 208 },
  { id: 7, name: "Blastoise Mega", rarity: 3, hp: 252 },
  { id: 8, name: "Blaziken Mega", rarity: 3, hp: 224 },
  { id: 9, name: "Camerupt Mega", rarity: 2, hp: 196 },
  { id: 10, name: "Charizard Mega Y", rarity: 5, hp: 218 },
  { id: 11, name: "Diancie Mega", rarity: 2, hp: 160 },
  { id: 12, name: "Gallade Mega", rarity: 2, hp: 163 },
  { id: 13, name: "Garchomp Mega", rarity: 4, hp: 302 },
  { id: 14, name: "Gardevoir Mega", rarity: 3, hp: 163 },
  { id: 15, name: "Gengar Mega", rarity: 4, hp: 144 },
  { id: 16, name: "Glalie Mega", rarity: 3, hp: 224 },
  { id: 17, name: "Gyarados Mega", rarity: 4, hp: 304 },
  { id: 18, name: "Houndoom Mega", rarity: 3, hp: 210 },
  { id: 19, name: "Heracross Mega", rarity: 3, hp: 256 },
  { id: 20, name: "Kangaskhan Mega", rarity: 4, hp: 294 },
  { id: 21, name: "Latios Mega", rarity: 5, hp: 224 },
  { id: 22, name: "Lopunny Mega", rarity: 2, hp: 182 },
  { id: 23, name: "Lucario Mega", rarity: 3, hp: 168 },
  { id: 24, name: "Manectric Mega", rarity: 2, hp: 196 },
  { id: 25, name: "Medicham Mega", rarity: 1, hp: 144 },
  { id: 26, name: "Meganium", rarity: 3, hp: 256 },
  { id: 27, name: "Metagross Mega", rarity: 3, hp: 256 },
  { id: 28, name: "Pidgeot Mega", rarity: 3, hp: 232 },
  { id: 29, name: "Pinsir Mega", rarity: 1, hp: 208 },
  { id: 30, name: "Sceptile Mega", rarity: 3, hp: 224 },
  { id: 31, name: "Sableye Mega", rarity: 1, hp: 140 },
  { id: 32, name: "Scizor Mega", rarity: 3, hp: 224 },
  { id: 33, name: "Sharpedo Mega", rarity: 3, hp: 224 },
  { id: 34, name: "Swampert Mega", rarity: 4, hp: 320 },
  { id: 35, name: "Steelix Mega", rarity: 3, hp: 240 },
  { id: 36, name: "Tyranitar Mega", rarity: 4, hp: 320 },
  { id: 37, name: "Venusaur Mega", rarity: 3, hp: 256 },
  { id: 38, name: "Rayquaza Mega", rarity: 4, hp: 294 },
  { id: 39, name: "Salamence Mega", rarity: 4, hp: 266 },
];

const NFT_CONTRACT = "0xDc74da1175419D36882806D588B8033B1c28E6d7";

const nftAbi = [
  "function mintPokemon(address to, string memory tokenURI, uint256 rarity) external",
  "function nextTokenId() view returns (uint256)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
];

let provider, signer, userAddress;

// ======================================
// CONNECT WALLET
// ======================================
async function connectForMinting() {
  if (!window.ethereum) {
    alert("MetaMask not detected");
    return false;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    
    console.log(`✅ Connected: ${userAddress}`);
    return true;
  } catch (err) {
    console.error("❌ Connection failed:", err);
    alert("Failed to connect wallet");
    return false;
  }
}

// ======================================
// MINT SINGLE NFT
// ======================================
async function mintSingleNFT(tokenId, recipientAddress, rarityLevel) {
  try {
    const nftContract = new ethers.Contract(NFT_CONTRACT, nftAbi, signer);
    
    // Build IPFS link
    const ipfsHash = IPFS_METADATA_HASHES[tokenId];
    if (!ipfsHash) {
      throw new Error(`No IPFS hash found for token ${tokenId}`);
    }
    
    const tokenURI = `ipfs://${ipfsHash}/${tokenId}.json`;
    
    console.log(`Minting token #${tokenId}...`);
    console.log(`   URI: ${tokenURI}`);
    console.log(`   Rarity: ${rarityLevel}`);
    
    const tx = await nftContract.mintPokemon(
      recipientAddress,
      tokenURI,
      BigInt(rarityLevel)
    );
    
    console.log(`TX Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`Token #${tokenId} minted successfully!`);
      return true;
    } else {
      console.error(`Transaction failed for token #${tokenId}`);
      return false;
    }
  } catch (err) {
    console.error(`Mint failed for token #${tokenId}:`, err.message);
    return false;
  }
}

// ======================================
// BATCH MINT NFTs
// ======================================
async function batchMintNFTs(startId = 0, endId = 40, recipientAddress = null) {
  // Ensure wallet is connected before minting
  if (!signer) {
    console.log("Connecting wallet...");
    const connected = await connectForMinting();
    if (!connected) {
      console.error("Failed to connect wallet. Cannot proceed with minting.");
      return;
    }
  }

  if (!recipientAddress) {
    recipientAddress = userAddress;
  }

  console.log(`\n🚀 Starting batch mint...`);
  console.log(`   From: #${startId} to #${endId - 1}`);
  console.log(`   Recipient: ${recipientAddress}`);
  console.log(`   Total: ${endId - startId} NFTs\n`);

  let successCount = 0;
  let failedCount = 0;
  const failedTokens = [];

  for (let i = startId; i < endId; i++) {
    const pokemon = POKEMON_DATA.find(p => p.id === i);
    if (!pokemon) {
      console.warn(`⚠️ No data for token #${i}, skipping...`);
      failedCount++;
      failedTokens.push(i);
      continue;
    }

    const success = await mintSingleNFT(i, recipientAddress, pokemon.rarity);
    
    if (success) {
      successCount++;
    } else {
      failedCount++;
      failedTokens.push(i);
    }

    // Add delay between mints to avoid RPC rate limiting
    if (i < endId - 1) {
      console.log("⏳ Waiting 3 seconds before next mint...\n");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n📊 Batch Mint Complete!`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  if (failedTokens.length > 0) {
    console.log(`   Failed tokens: ${failedTokens.join(", ")}`);
  }
}

// ======================================
// QUICK MINT ALL (Run in Console)
// ======================================
window.quickMintAll = async function() {
  if (!userAddress) {
    console.log("Connecting wallet...");
    const connected = await connectForMinting();
    if (!connected) return;
  }
  
  await batchMintNFTs(0, 40);
};

// ======================================
// VERIFY CONTRACT DEPLOYMENT
// ======================================
window.verifyContract = async function() {
  try {
    if (!window.ethereum) {
      console.error("MetaMask not detected");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const code = await provider.getCode(NFT_CONTRACT);
    
    console.log("\n=== CONTRACT VERIFICATION ===");
    console.log(`Contract Address: ${NFT_CONTRACT}`);
    
    if (code === "0x") {
      console.error("ERROR: No contract found at this address on Sepolia!");
      console.log("\nPossible solutions:");
      console.log("1. Verify the contract address is correct");
      console.log("2. Check if contract was deployed to Sepolia testnet");
      console.log("3. Redeploy the contract using Remix: https://remix.ethereum.org");
      return false;
    }
    
    console.log("Contract code length:", code.length);
    console.log("SUCCESS: Contract is deployed at this address!");
    return true;
  } catch (err) {
    console.error("Verification error:", err.message);
  }
};

// ======================================
// DIAGNOSE MINTING ISSUES
// ======================================
window.diagnose = async function() {
  try {
    if (!window.ethereum) {
      console.error("MetaMask not detected");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddr = await signer.getAddress();
    const balance = await provider.getBalance(userAddr);
    const network = await provider.getNetwork();

    console.log("\n=== DIAGNOSTIC REPORT ===");
    console.log(`Connected Address: ${userAddr}`);
    console.log(`ETH Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
    
    if (network.name !== "sepolia") {
      console.error("ERROR: You're not on Sepolia testnet!");
      console.log("Please switch to Sepolia in MetaMask");
      return;
    }

    if (balance === 0n) {
      console.error("ERROR: You have 0 ETH! You need ETH for gas fees.");
      console.log("Get test ETH from: https://sepoliafaucet.com");
      return;
    }

    console.log("\nTrying to read contract data...");
    const nftContract = new ethers.Contract(NFT_CONTRACT, nftAbi, provider);
    
    try {
      // Try calling a simple read function to verify contract works
      const nextId = await nftContract.nextTokenId();
      console.log(`Next Token ID on contract: ${nextId}`);
      console.log("SUCCESS: Contract is responding correctly!");
    } catch (readErr) {
      console.error("ERROR reading contract:", readErr.message);
      console.log("The contract might not have the expected functions");
      return;
    }

    console.log("\n=== NEXT STEP ===");
    console.log("Try minting with: await mintTools.mintOne(0, '" + userAddr + "', 4)");
    console.log("This will attempt to mint token #0");

  } catch (err) {
    console.error("Diagnostic error:", err.message);
  }
};

// ======================================
// EXPORT FOR CONSOLE USE
// ======================================
window.mintTools = {
  connect: connectForMinting,
  mintOne: mintSingleNFT,
  batchMint: batchMintNFTs,
  quickMintAll: window.quickMintAll,
  verify: window.verifyContract,
  diagnose: window.diagnose
};

console.log(`
╔════════════════════════════════════════════╗
║     🚀 BATCH MINTING TOOLS LOADED          ║
╚════════════════════════════════════════════╝

Available commands:
  • await mintTools.connect()
    → Connect MetaMask wallet

  • await mintTools.mintOne(tokenId, address, rarity)
    → Mint a single NFT

  • await mintTools.batchMint(startId, endId, recipientAddress)
    → Mint range of NFTs
    → Default: startId=0, endId=40, recipientAddress=connected wallet

  • await mintTools.quickMintAll()
    → Quick start: mint all 40 Pokémon

Example:
  await mintTools.connect()
  await mintTools.batchMint(0, 5)
`);
