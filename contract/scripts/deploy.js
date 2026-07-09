// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());

  // 1. Deploy CarbonCreditToken
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const carbonToken = await CarbonCreditToken.deploy(
    "https://example.com/metadata/{id}.json"
  );
  await carbonToken.deployed(); // ✅ ethers v5 style
  console.log("CarbonCreditToken deployed at:", carbonToken.address);

  // 2. Deploy CarbonRegistry with token address
  const CarbonRegistry = await hre.ethers.getContractFactory("CarbonRegistry");
  const registry = await CarbonRegistry.deploy(carbonToken.address);
  await registry.deployed(); // ✅
  console.log("CarbonRegistry deployed at:", registry.address);

  // 3. Deploy CarbonMarketplace with token + fee recipient (deployer)
  const CarbonMarketplace = await hre.ethers.getContractFactory("CarbonMarketplace");
  const marketplace = await CarbonMarketplace.deploy(
    carbonToken.address,
    deployer.address // feeRecipient
  );
  await marketplace.deployed(); // ✅
  console.log("CarbonMarketplace deployed at:", marketplace.address);

  // 4. Give REGISTRY permission to mint tokens
  const MINTER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );

  const tx = await carbonToken.grantRole(MINTER_ROLE, registry.address);
  await tx.wait();
  console.log("Granted MINTER_ROLE to CarbonRegistry");

  console.log("\n=== Save these addresses for backend/frontend ===");
  console.log("CARBON_TOKEN_ADDRESS =", carbonToken.address);
  console.log("REGISTRY_ADDRESS     =", registry.address);
  console.log("MARKETPLACE_ADDRESS  =", marketplace.address);

  // Auto-update Backend .env file
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, "../../Backend/.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(/CARBON_TOKEN_ADDRESS\s*=\s*.*/g, `CARBON_TOKEN_ADDRESS=${carbonToken.address}`);
    envContent = envContent.replace(/REGISTRY_CONTRACT_ADDRESS\s*=\s*.*/g, `REGISTRY_CONTRACT_ADDRESS=${registry.address}`);
    envContent = envContent.replace(/MARKETPLACE_CONTRACT_ADDRESS\s*=\s*.*/g, `MARKETPLACE_CONTRACT_ADDRESS=${marketplace.address}`);
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Auto-updated Backend/.env with new contract addresses");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
