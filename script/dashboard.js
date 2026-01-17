// ========================================
// Pokémon NFT Dashboard + Wallet Integration
// Sepolia Testnet - Remix + MetaMask
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚡ Dashboard Loaded — Wallet + Contract Ready");

  // ========================================
  // SET ACTIVE NAVIGATION
  // ========================================
  function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const li = link.querySelector('li');
      
      if (!li) return;
      
      li.classList.remove('active');
      
      // Map page names to check conditions
      let isActive = false;
      
      // For Home page (index.html)
      if (currentPage === 'index.html' || currentPage === '') {
        if (href === '#') isActive = true;
      }
      // For Marketplace page
      else if (currentPage === 'marketplace.html') {
        if (href === '#' || href.includes('marketplace')) isActive = true;
      }
      // For Game page (play.html)
      else if (currentPage === 'play.html') {
        if (href === '#' || href.includes('play')) isActive = true;
      }
      // For Mint page
      else if (currentPage === 'mint.html') {
        if (href === '#' || href.includes('mint')) isActive = true;
      }
      
      if (isActive) {
        li.classList.add('active');
      }
    });
  }
  
  // Hide Mint nav for non-admin users (uses adminAuth flag from localStorage)
  function restrictMintNavigation() {
    // Reverted: show Mint to everyone
    const mintDropdown = document.querySelector('.mint-dropdown');
    if (mintDropdown) {
      mintDropdown.style.display = '';
    }
  }
  
  setActiveNavigation();
  restrictMintNavigation();

  // ========================================
  // DROPDOWN MENU HANDLING
  // ========================================
  function initializeDropdown() {
    const mintDropdown = document.querySelector('.mint-dropdown');
    const mintDropdownTrigger = document.querySelector('.mint-dropdown-trigger');
    
    if (mintDropdownTrigger) {
      mintDropdownTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        mintDropdown.classList.toggle('mint-dropdown-active');
      });
    }
    
    // Close dropdown when clicking on a submenu link
    const submenuLinks = document.querySelectorAll('.mint-submenu li a');
    submenuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Allow navigation but close dropdown
        mintDropdown.classList.remove('mint-dropdown-active');
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mint-dropdown')) {
        mintDropdown.classList.remove('mint-dropdown-active');
      }
    });
  }
  
  initializeDropdown();

  // -------------------- CONTRACT CONFIG --------------------
  const NFT_CONTRACT = "0xDc74da1175419D36882806D588B8033B1c28E6d7";
  const TOKEN_CONTRACT = "0x6E23b691D086Ae9373995092b2783DACBbef225e";
  const MARKET_CONTRACT = "0x7FA35D4C5b94112058Cc6dE8ABa002E337b20D08";
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

  // IPFS gateway preferences (custom Pinata first)
  const IPFS_GATEWAYS = [
    (hashOrPath) => `https://amethyst-giant-newt-388.mypinata.cloud/ipfs/${hashOrPath}`,
    (hashOrPath) => `https://gateway.pinata.cloud/ipfs/${hashOrPath}`,
    (hashOrPath) => `https://dweb.link/ipfs/${hashOrPath}`,
    (hashOrPath) => `https://cf-ipfs.com/ipfs/${hashOrPath}`,
    (hashOrPath) => `https://ipfs.io/ipfs/${hashOrPath}`,
  ];

  // CID remapping for images (user updated GIF folder CID)
  const GIF_CID_OLD = "bafybeialp2okoiyl24adqzygeadfybv2cgysmcezdpsnnswlwd6jm3pcla";
  const GIF_CID_NEW = "bafybeifsnozi4jhmf7ezefai3rlorzo6ihb2ahvomh4os4ligczy55qutm";
  const META_CID_OLD = "bafybeialp2okoiyl24adqzygeadfybv2cgysmcezdpsnnswlwd6jm3pcla"; // wrong
  const META_CID_NEW = "bafybeifyeektgpegzb6ajwxdmid2qwexko3v2skp4k6uav4b5yo64x4aku"; // latest

  function resolveIpfsToHttp(uri) {
    if (!uri) return [];
    if (uri.startsWith("ipfs://")) {
      const hashPath = uri.slice("ipfs://".length);
      return IPFS_GATEWAYS.map(g => g(hashPath));
    }
    return [uri];
  }

  async function fetchIpfsJson(uri) {
    const candidates = resolveIpfsToHttp(uri);
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          console.log(`🌐 Loaded via: ${url}`);
          return await res.json();
        }
      } catch (e) {}
    }
    throw new Error("All IPFS gateways failed");
  }

  // Simple image URL builder - no async, just returns the URL string
  function getImageUrl(ipfsImage) {
    if (!ipfsImage) return "";
    
    // Rewrite old CID to new CID if present
    if (ipfsImage.startsWith("ipfs://" + GIF_CID_OLD)) {
      ipfsImage = ipfsImage.replace(GIF_CID_OLD, GIF_CID_NEW);
    }
    
    // Extract hash and path
    if (ipfsImage.startsWith("ipfs://")) {
      const hashPath = ipfsImage.slice("ipfs://".length);
      return `https://amethyst-giant-newt-388.mypinata.cloud/ipfs/${hashPath}`;
    }
    
    return ipfsImage;
  }

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
  // INITIALIZE BALANCES TO 0 (NOT LOGGED IN)
  // ======================================
  function initializeBalances() {
    const navBalance = document.getElementById("navBalance");
    const balanceText = "0 ETH | 0 PKC";

    if (navBalance) navBalance.textContent = balanceText;
    if (wmBalance) wmBalance.textContent = balanceText;
    if (wmNetwork) wmNetwork.textContent = "NOT CONNECTED";
    if (connectBtn) {
      connectBtn.textContent = "CONNECT WALLET";
      connectBtn.style.background = "#ffca3b";
      connectBtn.style.color = "#fff";
    }

    // Clear cached display values when no wallet is connected
    localStorage.removeItem("walletBalance");
    localStorage.removeItem("walletAddress");
  }

  // ======================================
  // Auto-reconnect on page load (before initializing to 0)
  // ======================================
  (async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          console.log("🔄 Auto reconnecting wallet...");
          await connectWallet();
          document.dispatchEvent(new Event("walletConnected"));
          return; // Successfully reconnected, skip initialization
        }
      } catch (err) {
        console.error("Auto reconnect failed:", err);
      }
    }
    // Only initialize to 0 if no wallet was found
    initializeBalances();
  })();

// CONNECT WALLET
// ======================================
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install it first.");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    window.provider = provider; // ✅ Make provider accessible globally
    document.dispatchEvent(new Event("walletConnected")); // 🔔 Tell marketplace.js the wallet is ready
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    // Cache connected wallet for admin visibility checks
    localStorage.setItem("connectedWallet", userAddress);



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
      console.log(`🔍 Checking PokeCoin balance for: ${userAddress}`);
      console.log(`📍 TOKEN_CONTRACT: ${POKECOIN_CONTRACT}`);
      
      const pokeCoin = new ethers.Contract(POKECOIN_CONTRACT, pokeAbi, provider);
      
      // First verify the contract exists
      const code = await provider.getCode(POKECOIN_CONTRACT);
      if (code === "0x") {
        console.error("❌ ERROR: No contract found at TOKEN_CONTRACT address!");
        console.log("Please verify the TOKEN_CONTRACT address is correct on Sepolia.");
        pokeBal = "ERROR";
      } else {
        const decimals = await pokeCoin.decimals();
        console.log(`✅ Token decimals: ${decimals}`);
        
        const rawBal = await pokeCoin.balanceOf(userAddress);
        console.log(`✅ Raw balance: ${rawBal.toString()}`);
        
        pokeBal = parseFloat(ethers.formatUnits(rawBal, decimals)).toFixed(2);
        console.log(`✅ Formatted PokeCoin balance: ${pokeBal}`);
      }
    } catch (err) {
      console.error("❌ PokéCoin fetch failed:", err.message);
      console.error("Full error:", err);
      pokeBal = "0";
    }

    // Update Wallet Dropdown UI
    if (connectBtn) {
      connectBtn.textContent = shortAddr;
      connectBtn.style.background = "#22c55e";
      connectBtn.style.color = "#fff";
    }

    // Update balance, network, and explorer info
    const balanceText = `${formattedEth} ETH | ${pokeBal} PKC`;
    const navBalance = document.getElementById("navBalance");
    if (navBalance) navBalance.textContent = balanceText;
    if (wmBalance) wmBalance.textContent = balanceText;
    if (wmNetwork) wmNetwork.textContent = network.name.toUpperCase();

    // Update nav visibility now that wallet is known
    restrictMintNavigation();
    
    // Cache balance to localStorage so it persists across page navigation
    localStorage.setItem("walletBalance", balanceText);
    localStorage.setItem("walletAddress", userAddress);

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

        // Remap old metadata CID to new if needed
        const fixedTokenURI = tokenURI.startsWith("ipfs://" + META_CID_OLD)
          ? tokenURI.replace(META_CID_OLD, META_CID_NEW)
          : tokenURI;

        const metadata = await fetchIpfsJson(fixedTokenURI);

        const avatarImg = document.getElementById("wmAvatar");
        if (avatarImg && metadata.image) {
          avatarImg.src = getImageUrl(metadata.image);
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
  signer = null;
  provider = null;
  
  // Clear cached wallet data
  localStorage.removeItem("walletBalance");
  localStorage.removeItem("walletAddress");
  
  // Reset UI to default "not logged in" state
  const navBalance = document.getElementById("navBalance");
  if (navBalance) navBalance.textContent = "0 ETH | 0 PKC";
  if (wmBalance) wmBalance.textContent = "0 ETH | 0 PKC";
  if (wmNetwork) wmNetwork.textContent = "NOT CONNECTED";
  if (connectBtn) {
    connectBtn.textContent = "CONNECT WALLET";
    connectBtn.style.background = "#ffca3b";
    connectBtn.style.color = "#fff";
  }
  
  const wmAddressShort = document.getElementById("wmAddressShort");
  if (wmAddressShort) wmAddressShort.textContent = "Not Connected";
  
  if (walletMenu) walletMenu.setAttribute("aria-hidden", "true");
  
  const wmExplorer = document.getElementById("wmExplorer");
  if (wmExplorer) wmExplorer.href = "#";
  
  const wmAvatar = document.getElementById("wmAvatar");
  if (wmAvatar) wmAvatar.src = "./assets/icons/default-avatar.png"; // or your default avatar
  
  console.log("🔒 Wallet disconnected. Balances reset to 0.");
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

});
