// ========================================
// Pokémon NFT Minting Interface
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚡ Mint Page Loaded");

  // -------------------- CONTRACT CONFIG --------------------
  const NFT_CONTRACT = "0xDc74da1175419D36882806D588B8033B1c28E6d7";
  
  const nftAbi = [
    "function mintPokemon(address to, string memory tokenURI, uint256 rarity) external",
    "function balanceOf(address owner) view returns (uint256)",
  ];

  // -------------------- DOM ELEMENTS --------------------
  const connectBtn = document.getElementById("connectWalletBtn");
  const walletMenu = document.getElementById("walletMenu");
  const wmAddressShort = document.getElementById("wmAddressShort");
  const wmBalance = document.getElementById("wmBalance");
  const wmNetwork = document.getElementById("wmNetwork");
  const wmLogoutBtn = document.getElementById("wmLogoutBtn");
  const wmTrainerName = document.getElementById("wmTrainerName");
  
  const mintForm = document.getElementById("mintForm");
  const toAddressInput = document.getElementById("toAddress");
  const tokenURIInput = document.getElementById("tokenURI");
  const rarityInput = document.getElementById("rarity");
  const mintBtn = document.getElementById("mintBtn");
  const statusMessage = document.getElementById("statusMessage");
  const rarityBadges = document.querySelectorAll(".rarity-badge");

  let provider, signer, userAddress;

  // ======================================
  // RARITY SELECTION
  // ======================================
  rarityBadges.forEach(badge => {
    badge.addEventListener("click", () => {
      rarityBadges.forEach(b => b.classList.remove("selected"));
      badge.classList.add("selected");
      rarityInput.value = badge.dataset.rarity;
    });
  });

  // ======================================
  // CONNECT WALLET
  // ======================================
  async function connectWallet() {
    if (!window.ethereum) {
      showStatus("MetaMask not detected. Please install it first.", "error");
      return;
    }

    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      const network = await provider.getNetwork();
      if (network.name.toLowerCase() !== "sepolia") {
        showStatus("Please switch to the Sepolia Test Network.", "error");
      }

      const shortAddr = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

      // Update UI
      if (connectBtn) {
        connectBtn.textContent = shortAddr;
        connectBtn.style.color = "#fff";
      }

      // Set recipient to connected wallet by default
      toAddressInput.value = userAddress;

      if (wmAddressShort) wmAddressShort.textContent = shortAddr;
      if (wmNetwork) wmNetwork.textContent = network.name.toUpperCase();
      if (wmTrainerName) wmTrainerName.textContent = "Owner";

      const ethBalance = await provider.getBalance(userAddress);
      const formattedEth = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);
      if (wmBalance) wmBalance.textContent = `${formattedEth} ETH`;

      console.log(`✅ Wallet connected: ${userAddress}`);
      if (walletMenu) walletMenu.setAttribute("aria-hidden", "true");

    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      showStatus("Failed to connect wallet.", "error");
    }
  }

  // ======================================
  // DISCONNECT WALLET
  // ======================================
  function disconnectWallet() {
    userAddress = null;
    toAddressInput.value = "";
    if (connectBtn) {
      connectBtn.textContent = "CONNECT WALLET";
      connectBtn.style.background = "#ffca3b";
      connectBtn.style.color = "#fff";
    }
    if (walletMenu) walletMenu.setAttribute("aria-hidden", "true");
    console.log("🔒 Wallet disconnected.");
  }

  // ======================================
  // WALLET MENU TOGGLE
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

  connectBtn.addEventListener("click", async () => {
    if (!userAddress) await connectWallet();
  });

  if (wmLogoutBtn) wmLogoutBtn.addEventListener("click", disconnectWallet);

  // ======================================
  // AUTO RECONNECT
  // ======================================
  window.addEventListener("load", async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          console.log("🔄 Auto reconnecting wallet...");
          await connectWallet();
        }
      } catch (err) {
        console.error("Auto reconnect failed:", err);
      }
    }
  });

  // ======================================
  // SHOW STATUS MESSAGE
  // ======================================
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    if (type !== "loading") {
      setTimeout(() => {
        statusMessage.className = "status-message";
      }, 5000);
    }
  }

  // ======================================
  // MINT POKÉMON
  // ======================================
  mintForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userAddress) {
      showStatus("❌ Please connect your wallet first.", "error");
      return;
    }

    if (!toAddressInput.value || !tokenURIInput.value || !rarityInput.value) {
      showStatus("❌ Please fill in all fields and select a rarity.", "error");
      return;
    }

    try {
      showStatus("⏳ Processing mint transaction...", "loading");
      mintBtn.disabled = true;

      const toAddress = toAddressInput.value;
      const tokenURI = tokenURIInput.value;
      const rarity = BigInt(rarityInput.value);

      // Create contract instance with signer (for write operations)
      const nftContract = new ethers.Contract(NFT_CONTRACT, nftAbi, signer);

      // Call mintPokemon function
      console.log(`📤 Minting to: ${toAddress}`);
      console.log(`📝 Token URI: ${tokenURI}`);
      console.log(`⭐ Rarity: ${rarity}`);

      const tx = await nftContract.mintPokemon(toAddress, tokenURI, rarity);
      
      showStatus(`⏳ Transaction pending... ${tx.hash.slice(0, 10)}...`, "loading");
      console.log(`📡 Transaction hash: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        showStatus(`✅ Pokémon minted successfully! TX: ${receipt.hash.slice(0, 20)}...`, "success");
        console.log(`✅ Mint confirmed in block ${receipt.blockNumber}`);
        
        // Reset form
        mintForm.reset();
        rarityBadges.forEach(b => b.classList.remove("selected"));
        rarityInput.value = "";
        if (toAddressInput.value) {
          toAddressInput.value = userAddress; // Keep wallet address
        }
      } else {
        showStatus("❌ Transaction failed. Please try again.", "error");
      }

    } catch (err) {
      console.error("❌ Mint failed:", err);
      
      let errorMsg = "❌ Minting failed.";
      if (err.reason) errorMsg = `❌ ${err.reason}`;
      else if (err.message.includes("Only owner")) errorMsg = "❌ Only contract owner can mint.";
      else if (err.message.includes("user rejected")) errorMsg = "❌ Transaction rejected by user.";
      
      showStatus(errorMsg, "error");
    } finally {
      mintBtn.disabled = false;
    }
  });

  // ======================================
  // BATCH MINT HANDLER
  // ======================================
  const batchMintBtn = document.getElementById("batchMintBtn");
  const batchStartId = document.getElementById("batchStartId");
  const batchEndId = document.getElementById("batchEndId");
  const batchStatusMessage = document.getElementById("batchStatusMessage");

  if (batchMintBtn) {
    batchMintBtn.addEventListener("click", async () => {
      if (!userAddress) {
        showBatchStatus("❌ Please connect your wallet first.", "error");
        return;
      }

      const startId = parseInt(batchStartId.value) || 0;
      const endId = parseInt(batchEndId.value) || 40;

      if (startId >= endId) {
        showBatchStatus("❌ Start ID must be less than End ID.", "error");
        return;
      }

      batchMintBtn.disabled = true;
      showBatchStatus(`⏳ Starting batch mint (${startId}-${endId - 1})...`, "loading");

      try {
        await window.mintTools.batchMint(startId, endId, userAddress);
        showBatchStatus(`✅ Batch mint completed! Check console for details.`, "success");
      } catch (err) {
        console.error("Batch mint error:", err);
        showBatchStatus(`❌ Batch mint failed: ${err.message}`, "error");
      } finally {
        batchMintBtn.disabled = false;
      }
    });
  }

  function showBatchStatus(message, type) {
    batchStatusMessage.textContent = message;
    batchStatusMessage.className = `status-message ${type}`;
    
    if (type !== "loading") {
      setTimeout(() => {
        batchStatusMessage.className = "status-message";
      }, 6000);
    }
  }
});
