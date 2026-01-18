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
  const MARKET_CONTRACT = "0x7F56c14911Ab4235f8f9b11F88d74a7A7D3E4727";
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

  // Dashboard stat elements (stats card section)
  const statTotalPokemonEl = document.getElementById("statTotalPokemon");
  const statOwnedNFTsEl = document.getElementById("statOwnedNFTs");
  const statBattleWinsEl = document.getElementById("statBattleWins");
  const statVolumeEl = document.getElementById("statVolume");
  
  // Wallet menu stat elements
  const wmOwnedNFTsEl = document.getElementById("ownedNFTs");
  const wmBattleWinsEl = document.getElementById("battleWins");
  const wmVolumeEl = document.getElementById("volume");

  // Login modal elements
  const loginModal = document.getElementById("loginModal");
  const loginCloseBtn = document.getElementById("loginCloseBtn");
  const loginPrimaryBtn = document.getElementById("loginPrimaryBtn");
  const loginSecondaryBtn = document.getElementById("loginSecondaryBtn");
  const loginBackdrop = loginModal ? loginModal.querySelector(".login-modal__backdrop") : null;

  function openLoginModal() {
    if (!loginModal) return;
    loginModal.classList.add("is-open");
    loginModal.setAttribute("aria-hidden", "false");
  }

  function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove("is-open");
    loginModal.setAttribute("aria-hidden", "true");
  }

  if (loginCloseBtn) loginCloseBtn.addEventListener("click", closeLoginModal);
  if (loginBackdrop) loginBackdrop.addEventListener("click", closeLoginModal);
  if (loginSecondaryBtn) loginSecondaryBtn.addEventListener("click", closeLoginModal);
  if (loginPrimaryBtn) {
    loginPrimaryBtn.addEventListener("click", async () => {
      await connectWallet();
      closeLoginModal();
    });
  }

  let provider, signer, userAddress;

  // ======================================
  // LOAD DASHBOARD STATS
  // ======================================
  async function loadDashboardStats() {
    if (!userAddress) {
      console.log("❌ No user address found");
      return;
    }

    console.log("🔄 Loading dashboard stats for:", userAddress);

    try {
      // Initialize contracts
      const nftContract = new ethers.Contract(NFT_CONTRACT, nftAbi, provider);
      const marketAbi = [
        "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool active))",
      ];
      const marketContract = new ethers.Contract(MARKET_CONTRACT, marketAbi, provider);

      console.log("✅ Contracts initialized");
      console.log(`📍 NFT Contract: ${NFT_CONTRACT}`);
      console.log(`📍 Market Contract: ${MARKET_CONTRACT}`);

      // 1️⃣ Total Pokémon in Marketplace
      try {
        const totalCount = await nftContract.nextTokenId();
        const totalNumber = Number(totalCount);
        console.log(`📊 Total Pokémon in marketplace: ${totalNumber}`);
        if (statTotalPokemonEl) statTotalPokemonEl.textContent = totalNumber;
      } catch (err) {
        console.error("❌ Failed to fetch total Pokémon:", err);
        if (statTotalPokemonEl) statTotalPokemonEl.textContent = "0";
      }

      // 2️⃣ Owned NFTs (user's balance)
      let ownedCount = 0;
      try {
        const balance = await nftContract.balanceOf(userAddress);
        ownedCount = Number(balance);
        console.log(`🎁 Owned NFTs balance: ${ownedCount}`);
        if (statOwnedNFTsEl) statOwnedNFTsEl.textContent = ownedCount;
        if (wmOwnedNFTsEl) wmOwnedNFTsEl.textContent = ownedCount;
      } catch (err) {
        console.error("❌ Failed to fetch owned NFTs:", err);
        if (statOwnedNFTsEl) statOwnedNFTsEl.textContent = "0";
        if (wmOwnedNFTsEl) wmOwnedNFTsEl.textContent = "0";
      }

      // 3️⃣ Calculate Total Value of Owned NFTs
      try {
        let totalValue = 0n; // BigInt for precision
        let tokensFoundCount = 0;
        
        if (ownedCount > 0) {
          // Get total tokens to iterate through
          const totalTokens = await nftContract.nextTokenId();
          const totalNumber = Number(totalTokens);
          
          console.log(`🔍 Searching through tokens 0-${totalNumber - 1}...`);
          console.log(`📌 User address: ${userAddress}`);
          
          // Find all tokens owned by user and sum their listing prices
          for (let tokenId = 0; tokenId < totalNumber; tokenId++) {
            try {
              const owner = await nftContract.ownerOf(tokenId);
              const isOwnedByUser = owner.toLowerCase() === userAddress.toLowerCase();
              
              if (isOwnedByUser) {
                tokensFoundCount++;
                console.log(`✅ Token #${tokenId} OWNED by user (owner: ${owner})`);
                
                try {
                  // Get listing info for this token
                  const listing = await marketContract.getListing(tokenId);
                  console.log(`  Listing status: active=${listing.active}, price=${ethers.formatEther(listing.price)} ETH, seller=${listing.seller}`);
                  
                  if (listing.active && listing.seller.toLowerCase() === userAddress.toLowerCase()) {
                    totalValue += BigInt(listing.price);
                    const listingPrice = ethers.formatEther(listing.price);
                    console.log(`  💰 Adding ${listingPrice} ETH to total value`);
                  } else if (!listing.active) {
                    console.log(`  📦 Not active on marketplace`);
                  } else {
                    console.log(`  ⚠️ Listed by different address`);
                  }
                } catch (e) {
                  console.warn(`  ⚠️ Error getting listing:`, e.message);
                }
              }
            } catch (e) {
              // Silently continue
            }
          }
          
          console.log(`📊 Found ${tokensFoundCount} tokens owned by user`);
        } else {
          console.log("ℹ️ User owns 0 NFTs, skipping value calculation");
        }

        const totalValueEth = ethers.formatEther(totalValue);
        console.log(`💎 Total value of owned listed NFTs: ${totalValueEth} ETH`);
        if (statVolumeEl) {
          const displayValue = parseFloat(totalValueEth).toFixed(4);
          statVolumeEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg> ${displayValue}`;
          console.log(`✍️ Updated UI statVolumeEl to: ETH ${displayValue}`);
        }
        if (wmVolumeEl) {
          const displayValue = parseFloat(totalValueEth).toFixed(4);
          wmVolumeEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg> ${displayValue}`;
          console.log(`✍️ Updated UI wmVolumeEl to: ETH ${displayValue}`);
        }
      } catch (err) {
        console.error("❌ Failed to calculate owned NFTs value:", err);
        if (statVolumeEl) statVolumeEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg> 0`;
        if (wmVolumeEl) wmVolumeEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg> 0`;
      }

      // 4️⃣ Battle Wins (placeholder - set to 0 for now)
      if (statBattleWinsEl) statBattleWinsEl.textContent = "0";
      if (wmBattleWinsEl) wmBattleWinsEl.textContent = "0";

      console.log("✅ Dashboard stats loaded successfully!");

    } catch (err) {
      console.error("❌ loadDashboardStats error:", err);
    }
  }

  // ======================================
  // INITIALIZE BALANCES TO 0 (NOT LOGGED IN)
  // ======================================
  function initializeBalances() {
    const navBalance = document.getElementById("navBalance");
    const ethLogo = '<svg width="12" height="12" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 2px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg>';
    const balanceHtml = `${ethLogo} 0 ETH | 0 PKC`;

    if (navBalance) navBalance.innerHTML = balanceHtml;
    if (wmBalance) wmBalance.innerHTML = balanceHtml;
    if (wmNetwork) wmNetwork.textContent = "NOT CONNECTED";
    if (connectBtn) {
      connectBtn.textContent = "Login";
      connectBtn.style.background = "linear-gradient(120deg, #2f8bff, #6dd9ff)";
      connectBtn.style.color = "#041125";
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
      connectBtn.style.background = "linear-gradient(120deg, #1ed6ff, #3f8bff)";
      connectBtn.style.color = "#041125";
    }

    // Update balance, network, and explorer info
    const ethLogo = '<svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 2px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg>';
    const balanceHtml = `${ethLogo} ${formattedEth} ETH | ${pokeBal} PKC`;
    const navBalance = document.getElementById("navBalance");
    if (navBalance) navBalance.innerHTML = balanceHtml;
    if (wmBalance) wmBalance.innerHTML = balanceHtml;
    if (wmNetwork) wmNetwork.textContent = network.name.toUpperCase();

    // Update nav visibility now that wallet is known
    restrictMintNavigation();
    
    // Cache balance to localStorage so it persists across page navigation
    localStorage.setItem("walletBalance", `${formattedEth} ETH | ${pokeBal} PKC`);
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

    // 📊 Load Dashboard Stats
    await loadDashboardStats();

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
  const ethLogo = '<svg width="12" height="12" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 2px;"><path fill="#8A92B2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#62688F" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/><path fill="#62688F" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/><path fill="#454A75" d="M127.962 416.905v-104.72L0 236.585z"/><path fill="#8A92B2" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/><path fill="#62688F" d="M0 212.32l127.96 75.638v-133.8z"/></svg>';
  if (navBalance) navBalance.innerHTML = `${ethLogo} 0 ETH | 0 PKC`;
  if (wmBalance) wmBalance.innerHTML = `${ethLogo} 0 ETH | 0 PKC`;
  if (wmNetwork) wmNetwork.textContent = "NOT CONNECTED";
  if (connectBtn) {
    connectBtn.textContent = "Login";
    connectBtn.style.background = "linear-gradient(120deg, #2f8bff, #6dd9ff)";
    connectBtn.style.color = "#041125";
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
    if (!userAddress) {
      openLoginModal();
    }
  });

  if (wmLogoutBtn) wmLogoutBtn.addEventListener("click", disconnectWallet);

});
