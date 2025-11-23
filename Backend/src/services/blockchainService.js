const { ethers } = require("ethers");
require("dotenv").config();
const registryJSON = require("../contracts/CarbonRegistry.json");
const registryABI=registryJSON.abi 
// ABI file

// Load config
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS;

// Initialize provider & signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// Connect to registry contract
const registryContract = new ethers.Contract(
  REGISTRY_ADDRESS,
  registryABI,
  signer
);

module.exports = {
  // Called when user submits project (optional)
  registerProjectOnChain: async (projectId, owner, ipfsHash, credits) => {
    try {
      const tx = await registryContract.registerProject(
        owner,
        ipfsHash,
        credits
      );
      const receipt = await tx.wait();
      return {
        chainHash: receipt.hash
      };
    } catch (err) {
      console.log("registerProjectOnChain error:", err);
      throw err;
    }
  },

  // Called when auditor approves the project
  verifyAndMint: async (projectId, owner, credits) => {
    try {
      console.log("Calling verifyProject...");
      const tx1 = await registryContract.verifyProject(projectId);
      const receipt1 = await tx1.wait();

      console.log("Minting credits...");
      const tx2 = await registryContract.issueCredits(owner, credits);
      const receipt2 = await tx2.wait();

      return {
        tokenId: credits.toString(),     // You can adjust depending on contract design
        chainHash: receipt2.hash
      };
    } catch (err) {
      console.error("verifyAndMint error:", err);
      throw err;
    }
  }
};

