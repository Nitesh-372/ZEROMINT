const assert = require('assert');
const { ethers } = require('hardhat');

describe('CarbonRegistry + CarbonCreditToken', function () {
  let deployer, user, auditor;
  let carbonToken, registry;

  beforeEach(async () => {
    [deployer, user, auditor] = await ethers.getSigners();

    const CarbonCreditToken = await ethers.getContractFactory('CarbonCreditToken');
    carbonToken = await CarbonCreditToken.deploy('https://example.com/metadata/{id}.json');
    await carbonToken.deployed();

    const CarbonRegistry = await ethers.getContractFactory('CarbonRegistry');
    registry = await CarbonRegistry.deploy(carbonToken.address);
    await registry.deployed();

    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'));
    await carbonToken.grantRole(MINTER_ROLE, registry.address);
    await registry.addAuditor(auditor.address);
  });

  it('allows direct user submission and assigned auditor verification', async () => {
    await registry.connect(user).submitProject('ipfs://QmFakeHash', 'Solar', 100);
    assert.strictEqual((await registry.projectCount()).toString(), '1');

    await registry.assignAuditor(1, auditor.address);
    await registry.connect(auditor).verifyProject(1, 80);

    const project = await registry.getProject(1);
    assert.strictEqual(project.approvedCredits.toString(), '80');
    assert.strictEqual(project.status, 2);

    const balance = await carbonToken.balanceOf(user.address, 1);
    assert.strictEqual(balance.toString(), '80');
  });

  it('allows backend relayer submission and admin verification for JWT/Mongo prototype', async () => {
    await registry.submitProjectForOwner(user.address, 'mongodb://project/1', 'Reforestation', 120);
    await registry.assignAuditor(1, auditor.address);
    await registry.verifyProjectByAdmin(1, 100);

    const project = await registry.getProject(1);
    assert.strictEqual(project.owner, user.address);
    assert.strictEqual(project.approvedCredits.toString(), '100');

    const balance = await carbonToken.balanceOf(user.address, 1);
    assert.strictEqual(balance.toString(), '100');
  });
});
