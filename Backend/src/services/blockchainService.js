const { ethers } = require('ethers');
require('dotenv').config();

const tokenAbi = [
  'function adminTransfer(address from,address to,uint256 projectId,uint256 amount,bytes data)',
  'function adminBurn(address account,uint256 projectId,uint256 amount)',
];

const registryAbi = [
  'function submitProjectForOwner(address owner,string metaDataURI,string projectType,uint256 requestedCredits) returns (uint256)',
  'function assignAuditor(uint256 projectId,address auditor)',
  'function verifyProjectByAdmin(uint256 projectId,uint256 approvedCredits)',
  'function rejectProjectByAdmin(uint256 projectId,string reason)',
  'function requestMoreInfoByAdmin(uint256 projectId,string reason)',
  'function projectCount() view returns (uint256)',
  'function getProject(uint256 projectId) view returns (tuple(uint256 id,address owner,string metaDataURI,string projectType,uint256 requestedCredits,uint256 approvedCredits,address assignedAuditor,uint8 status,string lastComment))',
];

function configured() {
  return Boolean(process.env.RPC_URL && process.env.ADMIN_PRIVATE_KEY && process.env.REGISTRY_CONTRACT_ADDRESS && process.env.CARBON_TOKEN_ADDRESS);
}

function getSigner() {
  if (!process.env.RPC_URL || !process.env.ADMIN_PRIVATE_KEY) {
    const err = new Error('RPC_URL and ADMIN_PRIVATE_KEY are required');
    err.code = 'BLOCKCHAIN_NOT_CONFIGURED';
    throw err;
  }
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
}

function getTokenContract() {
  if (!process.env.CARBON_TOKEN_ADDRESS) {
    const err = new Error('CARBON_TOKEN_ADDRESS is not configured');
    err.code = 'BLOCKCHAIN_NOT_CONFIGURED';
    throw err;
  }
  return new ethers.Contract(process.env.CARBON_TOKEN_ADDRESS, tokenAbi, getSigner());
}

function getRegistryContract() {
  if (!configured()) {
    const missing = ['RPC_URL', 'ADMIN_PRIVATE_KEY', 'REGISTRY_CONTRACT_ADDRESS'].filter((key) => !process.env[key]);
    const err = new Error(`Blockchain environment is not configured: ${missing.join(', ')}`);
    err.code = 'BLOCKCHAIN_NOT_CONFIGURED';
    throw err;
  }
  return new ethers.Contract(process.env.REGISTRY_CONTRACT_ADDRESS, registryAbi, getSigner());
}

async function wait(tx) {
  const receipt = await tx.wait();
  return receipt;
}

module.exports = {
  isConfigured: configured,

  registerProjectOnChain: async ({ ownerWallet, metadataURI, projectType, creditsRequested }) => {
    const registry = getRegistryContract();
    const before = await registry.projectCount();
    const tx = await registry.submitProjectForOwner(ownerWallet, metadataURI, projectType, Number(creditsRequested));
    const receipt = await wait(tx);
    const after = await registry.projectCount();
    const onChainProjectId = Number(after > before ? after : before + 1n);
    return { onChainProjectId, chainHash: receipt.hash };
  },

  assignAuditor: async ({ onChainProjectId, auditorWallet }) => {
    const registry = getRegistryContract();
    const tx = await registry.assignAuditor(Number(onChainProjectId), auditorWallet);
    const receipt = await wait(tx);
    return { chainHash: receipt.hash };
  },

  verifyAndMint: async ({ onChainProjectId, approvedCredits }) => {
    const registry = getRegistryContract();
    const tx = await registry.verifyProjectByAdmin(Number(onChainProjectId), Number(approvedCredits));
    const receipt = await wait(tx);
    return { tokenId: String(onChainProjectId), chainHash: receipt.hash };
  },

  rejectProject: async ({ onChainProjectId, reason }) => {
    const registry = getRegistryContract();
    const tx = await registry.rejectProjectByAdmin(Number(onChainProjectId), reason || 'Rejected');
    const receipt = await wait(tx);
    return { chainHash: receipt.hash };
  },

  requestMoreInfo: async ({ onChainProjectId, reason }) => {
    const registry = getRegistryContract();
    const tx = await registry.requestMoreInfoByAdmin(Number(onChainProjectId), reason || 'More information required');
    const receipt = await wait(tx);
    return { chainHash: receipt.hash };
  },

  transferCredits: async ({ fromWallet, toWallet, tokenId, amount }) => {
    const token = getTokenContract();
    const tx = await token.adminTransfer(fromWallet, toWallet, Number(tokenId), Number(amount), '0x');
    const receipt = await wait(tx);
    return { chainHash: receipt.hash };
  },

  retireCredits: async ({ ownerWallet, tokenId, amount }) => {
    const token = getTokenContract();
    const tx = await token.adminBurn(ownerWallet, Number(tokenId), Number(amount));
    const receipt = await wait(tx);
    return { chainHash: receipt.hash };
  },
};


