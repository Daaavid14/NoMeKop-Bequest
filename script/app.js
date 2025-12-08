const CONFIG = {
  chainIdHex: "0xaa36a7", // Sepolia (change if needed)
  explorerBase: "https://sepolia.etherscan.io/address/"
};

// State
let provider = null;
let signer = null;
let userAddress = null;
let isWalletConnected = false;

// DOM helpers
const $ = id => document.getElementById(id);

// Utility: normalize dropdown element ids (support both wm* and wd* naming)
function pick(...ids) {
  for (const id of ids) {
    const el = $(id);
    if (el) return el;
  }
  return null;
}
function short(addr) { 
    return addr ? addr.slice(0,6) + "..." + addr.slice(-4) : ""; 
}

// ---------- Popup control (for not-connected users) ----------
function showPopup() {
  const p = $("walletPopup");
  if (p) p.style.display = "flex";
}
function hidePopup() {
  const p = $("walletPopup");
  if (p) p.style.display = "none";
}

// ---------- Dropdown menu control (for connected users) ----------
function showDropdown() {
  const menu = pick("walletMenu","walletDropdown","walletMenu"); // support variants
  if (!menu) return;
  menu.setAttribute("aria-hidden","false");
}
function hideDropdown() {
  const menu = pick("walletMenu","walletDropdown","walletMenu");
  if (!menu) return;    
  menu.setAttribute("aria-hidden","true");
}
function toggleDropdown() {
  const menu = pick("walletMenu","walletDropdown","walletMenu");
  if (!menu) return;
  const hidden = menu.getAttribute("aria-hidden")==="true";
  hidden ? showDropdown() : hideDropdown();
}

// ---------- Hover support (added) ----------
let _hoverEnabled = false;
let _enterHandler = null;
let _leaveHandler = null;
let _menuLeaveHandler = null;

function enableHoverDropdown() {
  if (_hoverEnabled) return;
  const btn = $("connectWalletBtn");
  const menu = pick("walletMenu","walletDropdown","walletMenu");
  if (!btn || !menu) return;

  // ensure menu hidden initially
  menu.setAttribute("aria-hidden","true");

  // mouseenter shows menu only if connected
  _enterHandler = () => {
    if (isWalletConnected) menu.setAttribute("aria-hidden","false");
  };

  // mouseleave: small delay to check if mouse moved into menu
  _leaveHandler = () => {
    setTimeout(() => {
      // if menu is hovered keep it open
      try {
        if (!menu.matches(":hover") && !btn.matches(":hover")) {
          menu.setAttribute("aria-hidden","true");
        }
      } catch (e) {
        // matches may not be supported in some old browsers; fallback hide immediately
        menu.setAttribute("aria-hidden","true");
      }
    }, 120);
  };

  // if leaving the menu area, hide quickly
  _menuLeaveHandler = () => {
    setTimeout(() => {
      try {
        if (!menu.matches(":hover") && !btn.matches(":hover")) {
          menu.setAttribute("aria-hidden","true");
        }
      } catch (e) {
        menu.setAttribute("aria-hidden","true");
      }
    }, 80);
  };

  btn.addEventListener("mouseenter", _enterHandler);
  btn.addEventListener("mouseleave", _leaveHandler);
  menu.addEventListener("mouseleave", _menuLeaveHandler);

  _hoverEnabled = true;
}

function disableHoverDropdown() {
  if (!_hoverEnabled) return;
  const btn = $("connectWalletBtn");
  const menu = pick("walletMenu","walletDropdown","walletMenu");
  if (btn && _enterHandler) btn.removeEventListener("mouseenter", _enterHandler);
  if (btn && _leaveHandler) btn.removeEventListener("mouseleave", _leaveHandler);
  if (menu && _menuLeaveHandler) menu.removeEventListener("mouseleave", _menuLeaveHandler);

  _enterHandler = null;
  _leaveHandler = null;
  _menuLeaveHandler = null;
  _hoverEnabled = false;

  if (menu) menu.setAttribute("aria-hidden","true");
}

// ---------- Connect wallet core ----------
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    // optional network check
    try {
      const net = await provider.getNetwork();
      const chainHex = "0x" + net.chainId.toString(16);
      if (chainHex !== CONFIG.chainIdHex) {
        console.warn(`Connected network ${chainHex} != expected ${CONFIG.chainIdHex}`);
        // you may prompt or automatically request switch here if desired
      }
    } catch(e) { /* ignore network check errors */ }

    isWalletConnected = true;

    // update connect button text
    const btn = $("connectWalletBtn");
    if (btn) btn.innerText = short(userAddress);

    // populate dropdown data (address, balance, explorer)
    await populateDropdown();

    // close popup if visible & show dropdown (user expects it)
    hidePopup();
    // enable hover behavior (instead of click toggle)
    enableHoverDropdown();

    // register listeners
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on("accountsChanged", onAccountsChanged);
      window.ethereum.on("chainChanged", onChainChanged);
    }

  } catch (err) {
    console.error("connectWallet error:", err);
    alert("Connection failed: " + (err?.message || err));
  }
}

// ---------- Populate dropdown info ----------
async function populateDropdown() {
  if (!isWalletConnected || !provider || !userAddress) return;

  try {
    const addrShortEl = pick("wmAddressShort","wdAddressShort");
    if (addrShortEl) addrShortEl.innerText = short(userAddress);

    const balanceEl = pick("wmBalance","wdBalance");
    if (balanceEl) {
      const bal = await provider.getBalance(userAddress);
      balanceEl.innerText = parseFloat(ethers.formatUnits(bal,"ether")).toFixed(4) + " ETH";
    }

    const netEl = pick("wmNetwork","wdNetwork");
    if (netEl) {
      const net = await provider.getNetwork();
      netEl.innerText = `${net.name} (${ "0x" + net.chainId.toString(16) })`;
    }

    const explorerEl = pick("wmExplorer","wdExplorer");
    if (explorerEl) explorerEl.href = CONFIG.explorerBase + userAddress;

  } catch (err) {
    console.warn("populateDropdown error", err);
  }
}

// ---------- Copy address ----------
async function copyAddress() {
  if (!userAddress) return alert("No address to copy");
  try {
    await navigator.clipboard.writeText(userAddress);
    const copyBtn = pick("wmCopyBtn","wdCopyBtn");
    if (copyBtn) {
      const old = copyBtn.innerText;
      copyBtn.innerText = "Copied!";
      setTimeout(()=> { copyBtn.innerText = old; }, 1200);
    }
  } catch (err) {
    alert("Copy failed: " + err.message);
  }
}

// ---------- Local logout (clear UI/state) ----------
function logoutLocal() {
  isWalletConnected = false;
  provider = null;
  signer = null;
  userAddress = null;

  const btn = $("connectWalletBtn");
  if (btn) btn.innerText = "CONNECT WALLET";

  hideDropdown();
  hidePopup();

  // clear dropdown fields
  const addressField = pick("wmAddressShort","wdAddressShort");
  if (addressField) addressField.innerText = "0x00...0000";
  const balanceField = pick("wmBalance","wdBalance");
  if (balanceField) balanceField.innerText = "— ETH";
  const networkField = pick("wmNetwork","wdNetwork");
  if (networkField) networkField.innerText = "—";

  // remove listeners (best-effort)
  if (window.ethereum && window.ethereum.removeListener) {
    try {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    } catch(e) {}
  }

  // disable hover behavior
  disableHoverDropdown();
}

// ---------- Wallet event handlers ----------
async function onAccountsChanged(accounts) {
  if (!accounts || accounts.length === 0) {
    // disconnected
    logoutLocal();
  } else {
    userAddress = accounts[0];
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = provider.getSigner();
    isWalletConnected = true;
    const btn = $("connectWalletBtn");
    if (btn) btn.innerText = short(userAddress);
    await populateDropdown();
    // ensure hover enabled after account change
    enableHoverDropdown();
  }
}

function onChainChanged(chainId) {
  // update menu info
  console.log("chainChanged", chainId);
  populateDropdown();
}

// ---------- Protected nav wiring ----------
function protectNavigation() {
  const protectedNav = [
    { id: "navMarketplace", href: "marketplace.html" },
    { id: "navPlayGames", href: "lobby.html" },
    { id: "navCollection", href: "collection.html" },
    { id: "navWhitepaper", href: "whitepaper.html" }
  ];
  protectedNav.forEach(nav => {
    const el = $(nav.id);
    if (!el) return;
    el.addEventListener("click", e => {
      if (!isWalletConnected) {
        e.preventDefault();
        showPopup();
        return;
      }
      if (!el.getAttribute("href")) window.location.href = nav.href;
    });
  });
}


// ---------- DOM wiring (on ready) ----------
document.addEventListener("DOMContentLoaded", () => {

  // Connect button: behaves as Connect when not connected, click does nothing when connected (hover will show menu)
  const connectBtn = $("connectWalletBtn");
  if (connectBtn) {
    connectBtn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      if (!isWalletConnected) {
        await connectWallet();
      } else {
        // intentionally do nothing on click when connected - hover shows menu
      }
    });
  } else {
    console.warn("connectWalletBtn not found in DOM");
  }

  // Popup buttons (if popup exists)
  const popupConnect = $("popupConnectBtn");
  if (popupConnect) popupConnect.addEventListener("click", connectWallet);
  const popupClose = $("popupCloseBtn");
  if (popupClose) popupClose.addEventListener("click", hidePopup);

  // Dropdown buttons (if dropdown exists)
  const copyBtn = pick("wmCopyBtn","wdCopyBtn");
  if (copyBtn) copyBtn.addEventListener("click", copyAddress);
  const logoutBtn = pick("wmLogoutBtn","wdLogoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    if (confirm("Log out from dApp (local)?")) logoutLocal();
  });

  // click outside to close dropdown (for cases where JS sets aria-hidden)
  document.addEventListener("click", (ev) => {
    const menu = pick("walletMenu","walletDropdown","walletMenu");
    const btn = $("connectWalletBtn");
    if (!menu) return;
    const hidden = menu.getAttribute("aria-hidden")==="true";
    if (hidden) return;
    const tgt = ev.target;
    if (menu.contains(tgt) || (btn && btn.contains(tgt))) return;
    hideDropdown();
  });

  // protect nav elements
  protectNavigation();

});
