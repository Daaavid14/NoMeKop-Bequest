// marketplace.js - Pokédex NFT Marketplace Integration

const NFT_CONTRACT = "0xBDDC9D6dB298f7486f73abD06083d4B84CDd7521";
const MARKET_CONTRACT = "0xE21f02Ba72524dd567aC5d56619feFA42C8EC03F";
const TOKEN_CONTRACT = "0xe909fB039ad0e5a2457ad4Ed9bb8393E926C9CC8";
const IPFS_BASE = "https://ipfs.io/ipfs/bafybeifzfohng4ai33uubclgfxi7z7zmmyca547uwrmtyfecnxflxjjnmm/";

const nftAbi = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)"
];

const marketAbi = [
  "function listings(uint256 tokenId) view returns (address seller, uint256 price)",
  "function buyPokemon(uint256 tokenId) external",
  "function listPokemon(uint256 tokenId, uint256 price) external"
];

const tokenAbi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let provider, signer, userAddress;

const connectBtn = document.getElementById("connectWalletBtn");
const marketGrid = document.getElementById("marketGrid");
const template = document.getElementById("nftCardTemplate");

// ========================= WALLET CONNECT =========================
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install it first.");
    return;
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  connectBtn.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
  connectBtn.style.background = "#22c55e";
  connectBtn.style.color = "#fff";
  loadMarketplace();
}
connectBtn.addEventListener("click", connectWallet);

// ========================= LOAD MARKETPLACE =========================
async function loadMarketplace() {
  const nft = new ethers.Contract(NFT_CONTRACT, nftAbi, provider);
  const market = new ethers.Contract(MARKET_CONTRACT, marketAbi, provider);

  let total = 0;
  try {
    // fallback to nextTokenId if totalSupply() is missing
    if (nft.totalSupply) {
      total = Number(await nft.totalSupply());
    } else {
      total = Number(await nft.nextTokenId());
    }
  } catch (err) {
    console.warn("⚠️ totalSupply() not found, using nextTokenId fallback:", err);
    total = Number(await nft.nextTokenId());
  }

  console.log(`🧩 Found ${total} Pokémon NFTs on chain`);

  if (total === 0) {
    marketGrid.innerHTML = "<p style='text-align:center;color:white;'>No Pokémon minted yet!</p>";
    return;
  }

  // now continue loading each NFT
  for (let i = 0; i < total; i++) {
    try {
      const uri = await nft.tokenURI(i);
      const metaUrl = uri.startsWith("ipfs://")
        ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        : uri;

      const res = await fetch(metaUrl);
      const meta = await res.json();

      console.log("✅ Loaded metadata:", meta);

      const card = template.content.cloneNode(true);
      const img = card.querySelector(".nft-image");
      const name = card.querySelector(".nft-name");

      img.src = meta.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      name.textContent = meta.name || `Pokemon #${i}`;

      marketGrid.appendChild(card);
    } catch (e) {
      console.error(`❌ Error loading token ${i}:`, e);
    }
  }
}


// ========================= LIST & BUY FUNCTIONS =========================
async function listPokemon(tokenId) {
  const price = prompt("Enter listing price in PKC:");
  if (!price || isNaN(price)) return;
  const market = new ethers.Contract(MARKET_CONTRACT, marketAbi, signer);
  const token = new ethers.Contract(TOKEN_CONTRACT, tokenAbi, signer);
  const priceWei = ethers.parseUnits(price.toString(), 18);
  await token.approve(MARKET_CONTRACT, priceWei);
  const tx = await market.listPokemon(tokenId, priceWei);
  await tx.wait();
  alert(`Pokémon #${tokenId} listed for ${price} PKC`);
  loadMarketplace();
}

async function buyPokemon(tokenId, price) {
  const market = new ethers.Contract(MARKET_CONTRACT, marketAbi, signer);
  const token = new ethers.Contract(TOKEN_CONTRACT, tokenAbi, signer);
  const priceWei = ethers.parseUnits(price.toString(), 18);
  await token.approve(MARKET_CONTRACT, priceWei);
  const tx = await market.buyPokemon(tokenId);
  await tx.wait();
  alert(`You bought Pokémon #${tokenId} for ${price} PKC!`);
  loadMarketplace();
}

console.log("🚀 Marketplace script loaded");

window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectWalletBtn");
  const marketGrid = document.getElementById("marketGrid");

  if (!connectBtn || !marketGrid) {
    console.error("❌ UI elements not found. Check your HTML IDs.");
    return;
  }

  connectBtn.addEventListener("click", async () => {
    try {
      await connectWallet();
    } catch (e) {
      console.error("⚠️ Wallet connection failed:", e);
      connectBtn.textContent = "CONNECT WALLET"; // stays visible even after failure
    }
  });

  console.log("✅ Event listeners set up. Waiting for wallet connection...");
});

