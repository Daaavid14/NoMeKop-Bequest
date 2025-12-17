
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