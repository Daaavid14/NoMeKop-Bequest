// ============================================
// 🔥 FIXED & MERGED MARKETPLACE SCRIPT (FINAL)
// ============================================

window.marketplaceLoaded = false;
console.log("🔥 Marketplace script loaded");

let provider;
let signer;
let marketContract;
let nftContract;
let userAddress;

const NFT_CONTRACT = "0xd9371a6c64d11936Dec44a8fC1a9CA3EBcA9e07c";
const TOKEN_CONTRACT = "0xe909fB039ad0e5a2457ad4Ed9bb8393E926C9CC8";
const MARKET_CONTRACT = "0x7F56c14911Ab4235f8f9b11F88d74a7A7D3E4727";

// ✅ NFT ABI (same as before)
const nftAbi = [
  "function nextTokenId() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function rarityLevel(uint256 tokenId) view returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)"
];

// ✅ Marketplace ABI (includes nftContract())
const marketAbi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nftContract",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getListing",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct Marketplace.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ===================================================
// 🔧 INITIALIZE PROVIDER, SIGNER, CONTRACTS
// ===================================================
async function initMarketplace() {
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    marketContract = new ethers.Contract(MARKET_CONTRACT, marketAbi, signer);

    // ✅ Fetch NFT address from Marketplace
    const nftAddress = await marketContract.nftContract();
    console.log("🎯 NFT Contract (from marketplace):", nftAddress);

    nftContract = new ethers.Contract(nftAddress, nftAbi, signer);

    window.nftContract = nftContract;
    window.marketContract = marketContract;
    console.log("✅ Marketplace initialized!");
  } catch (err) {
    console.error("❌ initMarketplace error:", err);
  }
}

// ===================================================
// 💰 SELL NFT
// ===================================================
async function sellNFT(tokenId, priceEth) {
  try {
    if (!marketContract || !nftContract) await initMarketplace();

    const userAddr = await signer.getAddress();
    const owner = await nftContract.ownerOf(tokenId);
    if (owner.toLowerCase() !== userAddr.toLowerCase()) {
      alert("❌ You do not own this NFT!");
      return;
    }

    const priceWei = ethers.parseEther(priceEth.toString());
    const approved = await nftContract.isApprovedForAll(userAddr, MARKET_CONTRACT);

    if (!approved) {
      console.log("🧾 Approving Marketplace...");
      const txApprove = await nftContract.setApprovalForAll(MARKET_CONTRACT, true);
      await txApprove.wait();
      console.log("✅ Marketplace approved!");
    }

    console.log(`💰 Listing NFT #${tokenId} for ${priceEth} ETH`);
    const tx = await marketContract.listNFT(tokenId, priceWei);
    await tx.wait(2);
    alert(`✅ Pokémon #${tokenId} listed for ${priceEth} ETH`);
  } catch (err) {
    console.error("❌ Sell error:", err);
    alert(`Sell failed: ${err.reason || err.message}`);
  }
}

// ===================================================
// 🛒 BUY NFT
// ===================================================
async function buyNFT(tokenId, priceEth) {
  try {
    const priceWei = ethers.parseEther(priceEth.toString());
    const tx = await marketContract.buyNFT(tokenId, { value: priceWei });
    await tx.wait(2);
    alert(`✅ Bought Pokémon #${tokenId} for ${priceEth} ETH`);
  } catch (err) {
    console.error("❌ Buy error:", err);
    alert(`Buy failed: ${err.reason || err.message}`);
  }
}

// ===================================================
// 🟣 MODAL & BUTTON HANDLERS
// ===================================================
let selectedTokenId = null;

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("sell-btn")) {
    selectedTokenId = e.target.dataset.id;
    document.getElementById("sellModal").classList.remove("hidden");
  }

  if (e.target.classList.contains("buy-btn")) {
    const tokenId = e.target.dataset.id;
    const price = e.target.textContent.replace(/[^\d.]/g, "");
    await buyNFT(tokenId, price);
  }
});

document.getElementById("confirmSellBtn").addEventListener("click", async () => {
  const priceInput = document.getElementById("sellPriceInput").value.trim();
  if (!priceInput || isNaN(priceInput)) return alert("Please enter a valid price.");
  await sellNFT(selectedTokenId, priceInput);
  document.getElementById("sellModal").classList.add("hidden");
});

document.getElementById("cancelSellBtn").addEventListener("click", () => {
  document.getElementById("sellModal").classList.add("hidden");
});

// ===================================================
// 🚀 ON LOAD
// ===================================================
window.addEventListener("load", async () => {
  if (window.ethereum) {
    console.log("🔗 Connecting wallet...");
    await initMarketplace();
    await loadNFTs();
  }
});


const grid = document.getElementById("marketGrid") || document.getElementById("nftGrid");
const connectBtn = document.getElementById("connectWalletBtn");

const TYPE_ICON_PATH = "./assets/types/";

// Wait for wallet connection before loading NFTs
document.addEventListener("walletConnected", async () => {
  console.log("🎯 Wallet connected — auto loading NFTs...");
  await loadNFTs();
});


function createTypeIcons(typeString) {
  if (!typeString) return "";
  const types = typeString.split("/").map(t => t.trim().toLowerCase());
  return types
    .map(t => `<img src="${TYPE_ICON_PATH + t}.png" alt="${t}" class="type-icon" />`)
    .join("");
}

// rarity.js (or inside your marketplace.js)
function getRarityBadge(rarity) {
  const rarities = {
    1: "common",
    2: "uncommon",
    3: "rare",
    4: "epic",
    5: "legendary"
  };

  const rarityClass = rarities[rarity] || "common";
  const rarityLabel = rarityClass.charAt(0).toUpperCase() + rarityClass.slice(1);

  return `<span class="rarity-badge ${rarityClass}">${rarityLabel}</span>`;
}


async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  const shortAddr = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
  connectBtn.textContent = shortAddr;
  connectBtn.style.background = "#22c55e";

  console.log("✅ Wallet connected:", userAddress);
  await initMarketplace();
  loadNFTs();
}

async function loadNFTs() {
  if (window.marketplaceLoaded) return;
  window.marketplaceLoaded = true;

  try {
    if (!window.provider) {
      console.log("⏳ Waiting for wallet provider...");
      return;
    }

    // ✅ Ensure signer is available (avoids undefined errors)
    if (!signer) {
      try {
        signer = await window.provider.getSigner();
      } catch (err) {
        console.warn("⚠️ Signer not found — running in read-only mode");
      }
    }

    const nft = new ethers.Contract(NFT_CONTRACT, nftAbi, window.provider);
    const total = await nft.nextTokenId();
    console.log(`🧩 Found ${total} NFTs on chain`);

    if (total == 0) {
      grid.innerHTML = `<p style="text-align:center;color:white;">No Pokémon minted yet!</p>`;
      return;
    }

    grid.innerHTML = "";
    allNFTs = []; // reset for filtering

    for (let i = 0; i < total; i++) {
      try {
        const uri = await nft.tokenURI(i);
        const rarity = await nft.rarityLevel(i);
        const metaUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(metaUrl);
        if (!response.ok) throw new Error("404 or unreachable");

        const metadata = await response.json();
        if (!metadata.name || !metadata.image) continue;

        const types = metadata.type ? metadata.type.toLowerCase().split("/") : [];

        // ===============================
        // AXIE-STYLE CARD RENDERING
        // ===============================
        const card = document.createElement("div");
        card.className = "pokemon-card";
        card.style.background = getTypeGradient(metadata.type.split("/")[0]); // First type sets gradient

        card.dataset.id = i;
        card.dataset.rarity = rarity;
        card.dataset.price = metadata.price;

        const tokenId = i; // ✅ FIXED — use loop index as token ID

        // 🧩 Add Buy & Sell buttons
        const actionDiv = document.createElement("div");
        actionDiv.classList.add("card-actions");

        // ✅ On-chain ownership check
        let isOwner = false;
        try {
          if (signer) {
            const userAddr = (await signer.getAddress()).toLowerCase();

            // 🔹 Fetch actual owner from blockchain
            const nftOwner = (await nft.ownerOf(tokenId)).toLowerCase();

            if (userAddr === nftOwner) {
              isOwner = true;
              console.log(`✅ You own NFT #${tokenId}`);
            } else {
              console.log(`❌ NFT #${tokenId} is owned by: ${nftOwner}`);
            }
          }
        } catch (err) {
          console.warn("⚠️ Ownership check error:", err.message);
        }


        // ✅ Conditional Button Rendering
        if (isOwner) {
          const sellBtn = document.createElement("button");
          sellBtn.textContent = "Sell";
          sellBtn.classList.add("sell-btn");
          sellBtn.dataset.id = tokenId;
          actionDiv.appendChild(sellBtn);
        } else if (metadata.listed && metadata.price) {
          const buyBtn = document.createElement("button");
          buyBtn.textContent = `Buy (${metadata.price} ETH)`;
          buyBtn.classList.add("buy-btn");
          buyBtn.dataset.id = tokenId;
          actionDiv.appendChild(buyBtn);
        } else if (!signer) {
          const connectBtn = document.createElement("button");
          connectBtn.textContent = "Connect Wallet to Trade";
          connectBtn.classList.add("buy-btn");
          actionDiv.appendChild(connectBtn);
        }

        const typeIcons = metadata.type
          .split("/")
          .map(
            t =>
              `<img src="./assets/types/${t.trim().toLowerCase()}.png" alt="${t}" class="type-icon"/>`
          )
          .join("");

        const priceETH = metadata.price ?? "0.004";

        card.innerHTML = `
          <div class="card-header">
            <div class="nft-id">#${String(i).padStart(5, "0")}</div>
            <div class="type-icons">${typeIcons}</div>
          </div>

          <div class="card-image">
            <img src="${metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}" alt="${metadata.name}" />
          </div>

          <div class="card-price">
            <span class="eth-symbol">ETH</span> ${priceETH}
          </div>

          <div class="card-footer">
            <h3 class="nft-name">${metadata.name}</h3>
            ${getRarityBadge(Number(rarity))}
          </div>
        `;


        if (actionDiv.children.length > 0) {
          card.appendChild(actionDiv);
        }
        
        // 🧩 Open modal when clicked
        card.addEventListener("click", () => {
          metadata.tokenId = i;
          metadata.priceETH = priceETH;
          openDetailsModal(metadata, rarity);
        });

        grid.appendChild(card);

      } catch (e) {
        console.warn(`⚠️ Error loading token ${i}:`, e.message);
      }
    }

    // ✅ Apply initial filter
    applyFilters();

  } catch (err) {
    console.error("❌ Error loading NFTs:", err);
  }
}



// 🌈 Dual-type gradient support + accent color for stats
function getTypeColor(typeString) {
  const colorMap = {
    fire: "#ff6f4355",
    water: "#42a4f555",
    grass: "#66bb6a55",
    electric: "#ffeb3b55",  
    ice: "#4fc2f755",
    fighting: "#ef535055",
    poison: "#ab47bc55",
    ground: "#8d6e6355",
    flying: "#5c6bc055",
    psychic: "#ec4079bf55",
    bug: "#9ccc6555",
    rock: "#bdbdbd55",
    ghost: "#7e57c255",
    dragon: "#26c6da55",
    dark: "#61616155",
    steel: "#90a4ae55",
    fairy: "#f48fb155",
    normal: "#bdbdbd55",
  };

  const types = typeString.split("/").map(t => t.trim().toLowerCase());
  const primary = colorMap[types[0]] || "#ffffff";
  const secondary = colorMap[types[1]] || primary;

  return {
    gradient: `linear-gradient(130deg, ${primary}, ${secondary}`,
    accent: primary,
  };
}

// ⚡ Create elemental particle effects
function setTypeParticles(typeString) {
  const typeParticles = document.getElementById("typeParticles");
  if (!typeParticles) return;

  const type = typeString.split("/")[0].trim().toLowerCase();
  typeParticles.className = ""; // reset any previous effect

  // Assign new class based on type
  switch (type) {
    case "fire": typeParticles.classList.add("fire-particles"); break;
    case "water": typeParticles.classList.add("water-particles"); break;
    case "electric": typeParticles.classList.add("electric-particles"); break;
    case "grass": typeParticles.classList.add("grass-particles"); break;
    case "psychic": typeParticles.classList.add("psychic-particles"); break;
    case "ghost": typeParticles.classList.add("ghost-particles"); break;
    default: typeParticles.classList.add("neutral-particles"); break;
  }
}


function openDetailsModal(metadata, rarity) {
  // 🧹 Clean up old injected info before adding a new one
document.querySelectorAll(".modal-extra-info").forEach(el => el.remove());


  // 🎨 Apply type-based gradient theme
  const typeColors = getTypeColor(metadata.type);
  const modalContent = document.querySelector(".details-content");
  modalContent.style.background = typeColors.gradient;

  setTypeParticles(metadata.type);

  const modal = document.getElementById("pokemonModal");
  const modalImage = document.getElementById("modalImage");
  const modalName = document.getElementById("modalName");
  const modalTypes = document.getElementById("modalTypes");
  const modalRarity = document.getElementById("modalRarity");
  const modalStats = document.getElementById("modalStats");
  const modalSkills = document.getElementById("modalSkills");

  // Fill image and name
  modalImage.src = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  modalName.textContent = metadata.name;

  // Fill types and rarity
  modalTypes.innerHTML = createTypeIcons(metadata.type);
  modalRarity.innerHTML = getRarityBadge(Number(rarity));

  // === Insert Unique ID + Price (Axie-style) ===
  let pokemonId = metadata.tokenId ?? metadata.id ?? "N/A";
  if (pokemonId !== "N/A") {
    pokemonId = String(pokemonId).padStart(5, "0"); // Adds leading zeros
  }

  const priceETH = metadata.priceETH ?? "0.004"; // Replace if your real price field is different

  const infoHTML = `
    <div class="modal-extra-info">
      <div class="pokemon-id">#${pokemonId}</div>
      <div class="eth-price"><span class="eth-symbol">ETH</span> ${priceETH}</div>
    </div>
  `;

// ✅ Insert only once above the Pokémon name
modalName.insertAdjacentHTML("beforebegin", infoHTML);

  // Base stats
  const stats = metadata.attributes.filter(a =>
    ["HP", "ATK", "DEF", "SPD"].includes(a.trait_type)
  );
  modalStats.innerHTML = stats.map(s => `
    <div class="stat">
      <label>${s.trait_type}</label>
      <div class="stat-bar">
        <div class="stat-fill" style="width:${Math.min(s.value / 2, 100)}%;"></div>
        <span>${s.value}</span>
      </div>
    </div>
  `).join("");

  // Skills
  const skills = [];
  for (let i = 1; i <= 4; i++) {
    const skill = {};
    metadata.attributes.forEach(a => {
      if (a.trait_type === `Skill ${i} Name`) skill.name = a.value;
      if (a.trait_type === `Skill ${i} Attack`) skill.attack = a.value;
      if (a.trait_type === `Skill ${i} Shield`) skill.shield = a.value;
      if (a.trait_type === `Skill ${i} Cost`) skill.cost = a.value;
      if (a.trait_type === `Skill ${i} Effect`) skill.effect = a.value;
    });
    if (skill.name) skills.push(skill);
  }

  modalSkills.innerHTML = skills.map(skill => `
    <div class="skill-card">
      <h4>${skill.name}</h4>
      <p><b>Attack:</b> ${skill.attack}</p>
      <p><b>Shield:</b> ${skill.shield}</p>
      <p><b>Cost:</b> ${skill.cost}</p>
      <p><b>Effect:</b> ${skill.effect || "-"}</p>
    </div>
  `).join("");

  // Show modal
  modal.style.display = "flex";

  // Close logic
  const closeBtn = modal.querySelector(".close-btn");
  closeBtn.onclick = () => (modal.style.display = "none");
  modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
}

connectBtn.addEventListener("click", connectWallet);

/*************************************************
 * 🧩 Enhanced Marketplace Filters (Type + Rarity + Price + Search)
 *************************************************/

const searchBox = document.getElementById("searchBox");
const typeButtons = document.querySelectorAll(".type-btn");
const rarityButtons = document.querySelectorAll(".filter-btn");
const priceDropdown = document.getElementById("priceFilter");

let allNFTs = []; // store all NFTs after loading

// 🟡 Called after NFT loading is complete
function onNFTsLoaded(nfts) {
  allNFTs = nfts.map((n, i) => ({ ...n, index: i })); // store original order
  applyFilters();
}

// 🔹 Main Filter Function
function applyFilters() {
  const query = searchBox ? searchBox.value.toLowerCase() : "";
  const activeRarity = document.querySelector(".filter-btn.active")?.dataset.rarity || "all";
  const activeType = document.querySelector(".type-btn.active")?.dataset.type || "all";
  const priceSort = priceDropdown ? priceDropdown.value : "default";

  // Select all cards
  const cards = Array.from(document.querySelectorAll(".pokemon-card"));

  // Apply type + rarity + search filters
    cards.forEach((card) => {
    const name = card.querySelector(".nft-name")?.textContent.toLowerCase() || "";
    const rarity = card.dataset.rarity || "";
    const typeIcons = Array.from(card.querySelectorAll(".type-icon"));
    const typeNames = typeIcons.map((t) => t.alt.toLowerCase());
    const price = parseFloat(card.dataset.price || "0");

    const matchesSearch = name.includes(query);
    const matchesType = activeType === "all" || typeNames.includes(activeType);
    const matchesRarity = activeRarity === "all" || rarity === activeRarity;

    if (matchesSearch && matchesType && matchesRarity) {
      card.style.display = "";
      card.dataset.price = price;
    } else {
      card.style.display = "none";
    }
  });

  // 🟢 Sorting
  const visibleCards = cards.filter((c) => c.style.display !== "none");
  let sortedCards;

  if (priceSort === "low") {
    sortedCards = visibleCards.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
  } else if (priceSort === "high") {
    sortedCards = visibleCards.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
  } else {
    // default — by unique ID
    sortedCards = visibleCards.sort((a, b) => parseInt(a.dataset.id) - parseInt(b.dataset.id));
  }

  const grid = document.getElementById("marketGrid");
  sortedCards.forEach((card) => grid.appendChild(card));
}

/*************************************************
 * 🧩 Event Listeners
 *************************************************/

// 🔸 Search Filter
if (searchBox) {
  searchBox.addEventListener("input", applyFilters);
}

// 🔸 Type Filter Buttons
typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    typeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

// 🔸 Rarity Filter Buttons
rarityButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    rarityButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

// 🔸 Price Sort Dropdown
if (priceDropdown) {
  priceDropdown.addEventListener("change", applyFilters);
}

/*************************************************
 * 🧩 Helper — Call this after your NFT load
 *************************************************/
// Example: inside your loadNFTs() after cards are displayed
// onNFTsLoaded(loadedNFTArray);


function getTypeGradient(type) {
  const colors = {
    Fire: "linear-gradient(180deg, #ff6a0026, #b83c0026)",
    Water: "linear-gradient(180deg, #00b4ff26, #0044aa26)",
    Grass: "linear-gradient(180deg, #00c85326, #00662226)",
    Electric: "linear-gradient(180deg, #ffeb3b26, #bfa30026)",
    Psychic: "linear-gradient(180deg, #d500f926, #6a00a326)",
    Ice: "linear-gradient(180deg, #00e5ff26, #0091ea26)",
    Rock: "linear-gradient(180deg, #a1887f26, #4e342e26)",
    Ground: "linear-gradient(180deg, #d7ccc826, #8d6e6326)",
    Flying: "linear-gradient(180deg, #81d4fa26, #0277bd26)",
    Bug: "linear-gradient(180deg, #aed58126, #33691e26)",
    Ghost: "linear-gradient(180deg, #7b1fa226, #311b9226)",
    Dragon: "linear-gradient(180deg, #7e57c226, #311b9226)",
    Steel: "linear-gradient(180deg, #b0bec526, #546e7a26)",
    Dark: "linear-gradient(180deg, #37474f26, #00000026)",
    Fairy: "linear-gradient(180deg, #f8bbd026, #c2185b26)",
    Normal: "linear-gradient(180deg, #e0e0e026, #75757526)",
  };
  return colors[type] || "linear-gradient(180deg, #444, #222)";
}