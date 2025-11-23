const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonRegistry + CarbonCreditToken", function () {
  let deployer, user, auditor;
  let carbonToken, registry;

  beforeEach(async () => {
    [deployer, user, auditor] = await ethers.getSigners();

    // Deploy token
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    carbonToken = await CarbonCreditToken.deploy("https://example.com/metadata/{id}.json");
    await carbonToken.deployed();

    // Deploy registry
    const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
    registry = await CarbonRegistry.deploy(carbonToken.address);
    await registry.deployed();

    // Grant MINTER_ROLE to registry
    const MINTER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("MINTER_ROLE")
    );
    await carbonToken.grantRole(MINTER_ROLE, registry.address);

    // Add auditor
    await registry.addAuditor(auditor.address);
  });

  it("should allow user to submit project and auditor to verify", async () => {
    // user submits project
    const metaDataURI = "ipfs://QmFakeHash";
    const projectType = "Solar";
    const requestedCredits = 100;

    const tx = await registry
      .connect(user)
      .submitProject(metaDataURI, projectType, requestedCredits);
    const receipt = await tx.wait();

    // projectCount should be 1
    const projectCount = await registry.projectCount();
    expect(projectCount).to.equal(1);

    // admin (deployer) assigns auditor
    await registry.assignAuditor(1, auditor.address);

    // auditor verifies project and approves 80 credits
    const approvedCredits = 80;
    await registry
      .connect(auditor)
      .verifyProject(1, approvedCredits);

    const project = await registry.getProject(1);
    expect(project.approvedCredits).to.equal(approvedCredits);
    expect(project.status).to.equal(2); // ProjectStatus.Verified (enum index)

    // Check token balance: tokenId = projectId = 1
    const balance = await carbonToken.balanceOf(user.address, 1);
    expect(balance).to.equal(approvedCredits);
  });
});
