console.log("🔥 Marketplace script loaded");

// Wait for wallet connection before loading NFTs
document.addEventListener("walletConnected", () => {
  console.log("🎯 Wallet connected event detected — loading NFTs...");
  if (typeof loadNFTs === "function") loadNFTs();
});


let provider;
let signer;
let userAddress;

const NFT_CONTRACT = "0x76b977265Dd333D16194547CBaa68135EEF270DC";
const MARKET_CONTRACT = "0xE21f02Ba72524dd567aC5d56619feFA42C8EC03F";

const nftAbi = [
  "function nextTokenId() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function rarityLevel(uint256 tokenId) view returns (uint256)"
];

const grid = document.getElementById("marketGrid") || document.getElementById("nftGrid");
const connectBtn = document.getElementById("connectWalletBtn");

const TYPE_ICON_PATH = "./assets/types/";

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
  loadNFTs();
}

async function loadNFTs() {
  try {
    if (!window.provider) {
      console.log("⏳ Waiting for wallet provider...");
      return; // stop silently until walletConnected fires
    }
    const provider = window.provider;


    const nft = new ethers.Contract(NFT_CONTRACT, nftAbi, provider);
    const total = await nft.nextTokenId();
    console.log(`🧩 Found ${total} NFTs on chain`);


    if (total == 0) {
      grid.innerHTML = `<p style="text-align:center;color:white;">No Pokémon minted yet!</p>`;
      return;
    }

    grid.innerHTML = "";

    for (let i = 0; i < total; i++) {
      try {
        const uri = await nft.tokenURI(i);
        const rarity = await nft.rarityLevel(i);
        const metaUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(metaUrl);

        if (!response.ok) throw new Error("404 or unreachable");
        const metadata = await response.json();

        if (!metadata.name || !metadata.image)  {
          console.warn(`⚠️ Skipping Token ${i} — invalid metadata`);
          continue;
        }

        console.log(`✅ Loaded metadata for Token ${i + 1}:`, metadata);

        // Card container
        const card = document.createElement("div");
        card.className = "pokemon-card";
        card.innerHTML = `
          <img src="${metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}" class="nft-img" alt="${metadata.name}" />
          <h3>${metadata.name}</h3>
          <div class="types">${createTypeIcons(metadata.type)}</div>
          ${getRarityBadge(Number(rarity))}
        `;

        // Open modal with stats
        card.addEventListener("click", () => openDetailsModal(metadata, rarity));

        grid.appendChild(card);
      } catch (e) {
        console.warn(`⚠️ Error loading token ${i}:`, e.message);
      }
    }
  } catch (err) {
    console.error("❌ Error loading NFTs:", err);
  }
}

// 🌈 Dual-type gradient support + accent color for stats
function getTypeColor(typeString) {
  const colorMap = {
    fire: "#ff6f43b9",
    water: "#42a4f5b5",
    grass: "#66bb6abb",
    electric: "#ffeb3bb4",  
    ice: "#4fc2f7b4",
    fighting: "#ef5350b4",
    poison: "#ab47bcb4",
    ground: "#8d6e63b4",
    flying: "#5c6bc0b4",
    psychic: "#ec4079bfb4",
    bug: "#9ccc65b4",
    rock: "#bdbdbdb4",
    ghost: "#7e57c2b4",
    dragon: "#26c6dab4",
    dark: "#616161b4",
    steel: "#90a4aeb4",
    fairy: "#f48fb1b4",
    normal: "#bdbdbdb4",
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

// ====================
// FILTER SYSTEM (Types + Rarity + Search)
// ====================

const searchBox = document.getElementById("searchBox");
const typeButtons = document.querySelectorAll(".type-btn");
const rarityButtons = document.querySelectorAll(".filter-btn");

let allNFTs = [];

async function loadNFTs() {
  try {
    const nft = new ethers.Contract(NFT_CONTRACT, nftAbi, provider);
    const total = await nft.nextTokenId();

    if (total == 0) {
      grid.innerHTML = `<p>No Pokémon minted yet!</p>`;
      return;
    }

    grid.innerHTML = "";
    allNFTs = [];

    for (let i = 0; i < total; i++) {
      const uri = await nft.tokenURI(i);
      const rarity = await nft.rarityLevel(i);
      const metaUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await fetch(metaUrl);
      const metadata = await res.json();

      const types = metadata.type ? metadata.type.toLowerCase().split("/") : [];

      const card = document.createElement("div");
      card.className = "pokemon-card";
      card.dataset.name = metadata.name.toLowerCase();
      card.dataset.rarity = rarity.toString();
      card.dataset.types = types.join(",");

      card.innerHTML = `
        <img src="${metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}" alt="${metadata.name}" />
        <h3>${metadata.name}</h3>
        <div>${getRarityBadge(Number(rarity))}</div>
        <div class="type-icons">
          ${types
            .map(
              t => `
              <img src="assets/types/${t}.png" alt="${t}" title="${t}" />
            `
            )
            .join("")}
        </div>

      `;

      card.addEventListener("click", () => openDetailsModal(metadata, rarity));
      grid.appendChild(card);
      allNFTs.push(card);
    }
  } catch (err) {
    console.error("❌ Error loading NFTs:", err);
  }
}

// ====================
// FILTER LOGIC
// ====================

function applyFilters() {
  const query = searchBox ? searchBox.value.toLowerCase() : "";
  const activeRarity = document.querySelector(".filter-btn.active")?.dataset.rarity || "all";
  const activeType = document.querySelector(".type-btn.active")?.dataset.type || "all";

  allNFTs.forEach(card => {
    const matchesSearch = card.dataset.name.includes(query);
    const matchesRarity = activeRarity === "all" || card.dataset.rarity === activeRarity;
    const matchesType = activeType === "all" || card.dataset.types.includes(activeType);

    card.style.display = matchesSearch && matchesRarity && matchesType ? "" : "none";
  });
}

// Search
if (searchBox) searchBox.addEventListener("input", applyFilters);

// Type buttons
typeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    typeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

// Rarity buttons
rarityButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    rarityButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});



