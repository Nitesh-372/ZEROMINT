const { ethers } = require('ethers');
require('dotenv').config();
(async () => {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const abi = ['function balanceOf(address account,uint256 id) view returns (uint256)'];
  const token = new ethers.Contract(process.env.CARBON_TOKEN_ADDRESS, abi, provider);
  const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const buyer = '0x90F79bf6EB2c4f870365E785982E1f101E93b906';
  const tokenId = 2;
  const ownerBalance = await token.balanceOf(owner, tokenId);
  const buyerBalance = await token.balanceOf(buyer, tokenId);
  console.log(JSON.stringify({ tokenId, ownerBalance: ownerBalance.toString(), buyerBalance: buyerBalance.toString() }));
})().catch((err) => { console.error(err.message); process.exit(1); });
