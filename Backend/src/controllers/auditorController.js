const Project = require('../models/Project');
const Credit = require('../models/Credit');
const { v4: uuidv4 } = require('uuid');
const blockchainService = require('../services/blockchainService');

function canAudit(user, project) {
  return user.role === 'admin' || String(project.assignedAuditor || '') === String(user._id);
}

exports.getAssigned = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedAuditor: req.user._id };
    const projects = await Project.find(filter).populate('owner', 'name email walletAddress').populate('assignedAuditor', 'name email walletAddress');
    return res.json({ projects });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.approveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const approvedCredits = Number(req.body.approvedCredits || req.body.credits || 0);
    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ msg: 'Not found' });
    if (!canAudit(req.user, project)) return res.status(403).json({ msg: 'Not assigned' });
    if (!project.onChainProjectId) return res.status(400).json({ msg: 'Project is missing onChainProjectId' });

    const amount = approvedCredits || project.creditsRequested;
    let tokenResult;
    try {
      tokenResult = await blockchainService.verifyAndMint({ onChainProjectId: project.onChainProjectId, approvedCredits: amount });
    } catch (err) {
      return res.status(502).json({ msg: 'Blockchain mint failed', err: err.message });
    }

    const credit = await Credit.create({
      creditId: `CR-${uuidv4()}`,
      project: project._id,
      owner: project.owner,
      ownerWallet: project.ownerWallet,
      amount,
      available: amount,
      tokenId: tokenResult.tokenId,
      txHash: tokenResult.chainHash,
      status: 'Available',
    });

    project.status = 'Minted';
    project.creditsApproved = amount;
    project.approvalHash = tokenResult.chainHash || '';
    project.lastComment = `${amount} credits approved and minted.`;
    await project.save();

    return res.json({ msg: 'Project approved and credits issued', credit, project });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.rejectProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reason = req.body.reason || 'Rejected by auditor';
    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ msg: 'Not found' });
    if (!canAudit(req.user, project)) return res.status(403).json({ msg: 'Not assigned' });

    if (project.onChainProjectId) {
      try {
        const chain = await blockchainService.rejectProject({ onChainProjectId: project.onChainProjectId, reason });
        project.approvalHash = chain.chainHash || project.approvalHash;
      } catch (err) {
        return res.status(502).json({ msg: 'Blockchain reject failed', err: err.message });
      }
    }

    project.status = 'Rejected';
    project.lastComment = reason;
    await project.save();
    return res.json({ msg: 'Project rejected', project });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.requestMoreInfo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reason = req.body.reason || 'More information required';
    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ msg: 'Not found' });
    if (!canAudit(req.user, project)) return res.status(403).json({ msg: 'Not assigned' });

    if (project.onChainProjectId) {
      try {
        const chain = await blockchainService.requestMoreInfo({ onChainProjectId: project.onChainProjectId, reason });
        project.approvalHash = chain.chainHash || project.approvalHash;
      } catch (err) {
        return res.status(502).json({ msg: 'Blockchain more-info request failed', err: err.message });
      }
    }

    project.status = 'Need More Info';
    project.lastComment = reason;
    await project.save();
    return res.json({ msg: 'More information requested', project });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};
