// ========================================
// Pokémon NFT Dashboard + Wallet Integration
// Sepolia Testnet - Remix + MetaMask
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚡ Dashboard Loaded — Wallet + Contract Ready");

  // -------------------- CONTRACT CONFIG --------------------
  const NFT_CONTRACT = "0x76b977265Dd333D16194547CBaa68135EEF270DC";
  const TOKEN_CONTRACT = "0xe909fB039ad0e5a2457ad4Ed9bb8393E926C9CC8";
  const MARKET_CONTRACT = "0xE21f02Ba72524dd567aC5d56619feFA42C8EC03F";
  const POKECOIN_CONTRACT = TOKEN_CONTRACT;

  const nftAbi = [
    "function nextTokenId() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
  ];

  const pokeAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  // -------------------- DOM ELEMENTS --------------------
  const connectBtn = document.getElementById("connectWalletBtn");
  const walletMenu = document.getElementById("walletMenu");
  const wmAddressShort = document.getElementById("wmAddressShort");
  const wmBalance = document.getElementById("wmBalance");
  const wmNetwork = document.getElementById("wmNetwork");
  const wmLogoutBtn = document.getElementById("wmLogoutBtn");

  // Dashboard stat elements
  const totalPokemonEl = document.getElementById("totalPokemon");
  const ownedNFTsEl = document.getElementById("ownedNFTs");
  const battleWinsEl = document.getElementById("battleWins");
  const volumeEl = document.getElementById("volume");

  let provider, signer, userAddress;

 // ======================================
// CONNECT WALLET
// ======================================
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install it first.");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();



    const network = await provider.getNetwork();
    if (network.name.toLowerCase() !== "sepolia") {
      alert("Please switch to the Sepolia Test Network.");
    }

    const shortAddr = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

    // ETH Balance
    const ethBalance = await provider.getBalance(userAddress);
    const formattedEth = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);

    // PokéCoin Balance
    let pokeBal = "0";
    try {
      const pokeCoin = new ethers.Contract(POKECOIN_CONTRACT, pokeAbi, provider);
      const decimals = await pokeCoin.decimals();
      const rawBal = await pokeCoin.balanceOf(userAddress);
      pokeBal = parseFloat(ethers.formatUnits(rawBal, decimals)).toFixed(2);
    } catch (err) {
      console.warn("⚠️ PokéCoin fetch failed:", err);
    }

    // Update Wallet Dropdown UI
    if (connectBtn) {
      connectBtn.textContent = shortAddr;
      connectBtn.style.background = "#22c55e";
      connectBtn.style.color = "#fff";
    }

    // Update balance, network, and explorer info
    if (wmBalance) wmBalance.textContent = `${formattedEth} ETH | ${pokeBal} PKC`;
    if (wmNetwork) wmNetwork.textContent = network.name.toUpperCase();

    const explorerLink = `https://sepolia.etherscan.io/address/${userAddress}`;
    const wmExplorer = document.getElementById("wmExplorer");
    if (wmExplorer) wmExplorer.href = explorerLink;

    // Add trainer info (optional display)
    const wmTrainerName = document.getElementById("wmTrainerName");
    if (wmTrainerName) wmTrainerName.textContent = "David";

    // 🧩 Dynamic Trainer Avatar — show latest Pokémon NFT
    try {
      const nft = new ethers.Contract(NFT_CONTRACT, nftAbi, provider);
      const balance = await nft.balanceOf(userAddress);

      if (balance > 0) {
        const lastTokenIndex = Number(balance) - 1;
        const tokenId = lastTokenIndex; // assume sequential minting order
        const tokenURI = await nft.tokenURI(tokenId);

        const metaUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(metaUrl);
        const metadata = await response.json();

        const avatarImg = document.getElementById("wmAvatar");
        if (avatarImg && metadata.image) {
          avatarImg.src = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
          avatarImg.alt = metadata.name;
          console.log(`🖼️ Trainer avatar updated to: ${metadata.name}`);
        }
      } else {
        console.log("No Pokémon NFTs owned — using default avatar.");
      }
    } catch (err) {
      console.warn("⚠️ Failed to load trainer NFT avatar:", err);
    }


    console.log(`✅ Wallet connected: ${userAddress}`);
    if (walletMenu) walletMenu.setAttribute("aria-hidden", "true");

    // await loadDashboardData();

  } catch (err) {
    console.error("❌ Wallet connection failed:", err);
  }
}


// ======================================
// COPY WALLET ADDRESS
// ======================================
const wmCopyBtn = document.getElementById("wmCopyBtn");
if (wmCopyBtn) {
  wmCopyBtn.addEventListener("click", async () => {
    if (!userAddress) return;
    try {
      await navigator.clipboard.writeText(userAddress);
      wmCopyBtn.textContent = "Copied!";
      setTimeout(() => (wmCopyBtn.textContent = "Copy"), 1500);
    } catch (err) {
      console.error("❌ Failed to copy:", err);
    }
  });
}

// ======================================
// DISCONNECT WALLET
// ======================================
function disconnectWallet() {
  userAddress = null;
  if (connectBtn) {
    connectBtn.textContent = "CONNECT WALLET";
    connectBtn.style.background = "#ffca3b";
    connectBtn.style.color = "#fff";
  }
  if (walletMenu) walletMenu.setAttribute("aria-hidden", "true");
  console.log("🔒 Wallet disconnected.");
}

// Attach to logout button
if (wmLogoutBtn) wmLogoutBtn.addEventListener("click", disconnectWallet);

// ======================================
// HOVER MENU BEHAVIOR (unchanged)
// ======================================
let hoverTimeout;
function showMenu() {
  if (userAddress && walletMenu) {
    clearTimeout(hoverTimeout);
    walletMenu.setAttribute("aria-hidden", "false");
  }
}
function hideMenu() {
  hoverTimeout = setTimeout(() => {
    if (walletMenu) walletMenu.setAttribute("aria-hidden", "true");
  }, 200);
}
connectBtn.addEventListener("mouseenter", showMenu);
connectBtn.addEventListener("mouseleave", hideMenu);
if (walletMenu) {
  walletMenu.addEventListener("mouseenter", showMenu);
  walletMenu.addEventListener("mouseleave", hideMenu);
}


  // ======================================
  // CLICK TO CONNECT
  // ======================================
  connectBtn.addEventListener("click", async () => {
    if (!userAddress) await connectWallet();
  });

  if (wmLogoutBtn) wmLogoutBtn.addEventListener("click", disconnectWallet);

  // ======================================
  // AUTO RECONNECT
  // ======================================
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) await connectWallet();
    } catch (err) {
      console.warn("Auto reconnect failed:", err);
    }
  }
});

// ======================================
// MARKETPLACE INTEGRATION
// ======================================

const marketplaceNav = document.getElementById("marketplaceNav");
const marketplaceSection = document.getElementById("marketplaceSection");
const bannerSection = document.querySelector(".banner");
const statsSection = document.querySelector(".stats");

// Hide marketplace initially
marketplaceSection.classList.add("hidden");

// Marketplace click logic
marketplaceNav.addEventListener("click", () => {
  bannerSection.style.display = "none";
  statsSection.style.display = "none";
  marketplaceSection.classList.remove("hidden");

  if (!document.getElementById("marketplaceScript")) {
  const script = document.createElement("script");
  script.src = "script/marketplace.js";
  script.id = "marketplaceScript";
  script.onload = () => {
    console.log("🧩 Marketplace script loaded successfully");
    if (typeof loadNFTs === "function") loadNFTs(); // ✅ run only once after script loads
  };
  document.body.appendChild(script);
} else {
  // If already loaded, just refresh display
  if (typeof loadNFTs === "function") loadNFTs();
}

});


