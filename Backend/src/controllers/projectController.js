const Project = require('../models/Project');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const blockchainService = require('../services/blockchainService');

function canSeeProject(user, project) {
  return user.role === 'admin' || String(project.owner) === String(user._id) || String(project.assignedAuditor || '') === String(user._id);
}

exports.listProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : req.user.role === 'auditor'
        ? { assignedAuditor: req.user._id }
        : { owner: req.user._id };
    const projects = await Project.find(filter).populate('owner', 'name email walletAddress').populate('assignedAuditor', 'name email walletAddress');
    return res.json({ projects });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId }).populate('owner', 'name email walletAddress').populate('assignedAuditor', 'name email walletAddress');
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (!canSeeProject(req.user, project)) return res.status(403).json({ msg: 'Not authorized' });
    return res.json({ project });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const type = req.body.type || req.body.projectType;
    const title = req.body.title || req.body.projectName || req.body.name;
    const location = req.body.location || '';
    const description = req.body.description || '';
    const methodology = req.body.methodology || '';
    const creditsRequested = Number(req.body.creditsRequested || req.body.requestedCredits || 0);
    const ownerWallet = req.body.ownerWallet || req.user.walletAddress;
    const files = (req.files || []).map((file) => ({ filename: file.filename, path: file.path, kind: file.fieldname }));

    if (!type || !title || !creditsRequested || !ownerWallet) {
      return res.status(400).json({ msg: 'type, title, creditsRequested, and ownerWallet are required' });
    }

    const metadataURI = req.body.metadataURI || `mongodb://${req.user._id}/${Date.now()}`;
    let chainResult;
    try {
      chainResult = await blockchainService.registerProjectOnChain({ ownerWallet, metadataURI, projectType: type, creditsRequested });
    } catch (err) {
      const status = err.code === 'BLOCKCHAIN_NOT_CONFIGURED' ? 503 : 502;
      return res.status(status).json({ msg: 'Blockchain registration failed', err: err.message });
    }

    const project = await Project.create({
      projectId: `PRJ-${uuidv4()}`,
      onChainProjectId: chainResult.onChainProjectId,
      owner: req.user._id,
      ownerWallet,
      type,
      title,
      location,
      description,
      methodology,
      files,
      creditsRequested,
      chainHash: chainResult.chainHash,
      status: 'Pending',
      lastComment: 'Project registered on-chain and pending auditor assignment.',
    });

    return res.status(201).json({ msg: 'Project created and registered on-chain', project });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.getAssignedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedAuditor: req.user._id }).populate('owner', 'name email walletAddress');
    return res.json({ projects });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.listAuditors = async (req, res) => {
  try {
    const auditors = await User.find({ role: 'auditor' }).select('name email walletAddress orgName orgType createdAt');
    return res.json({ auditors });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.hireAuditor = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { auditorId } = req.body;
    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (String(project.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

    const auditor = await User.findById(auditorId);
    if (!auditor || auditor.role !== 'auditor') return res.status(400).json({ msg: 'Invalid auditor' });
    if (!auditor.walletAddress) return res.status(400).json({ msg: 'Auditor wallet address is required' });
    if (!project.onChainProjectId) return res.status(400).json({ msg: 'Project is missing onChainProjectId' });

    let chainResult;
    try {
      chainResult = await blockchainService.assignAuditor({ onChainProjectId: project.onChainProjectId, auditorWallet: auditor.walletAddress });
    } catch (err) {
      return res.status(502).json({ msg: 'Blockchain auditor assignment failed', err: err.message });
    }

    project.assignedAuditor = auditor._id;
    project.assignedAuditorWallet = auditor.walletAddress;
    project.status = 'Assigned';
    project.lastComment = `Auditor ${auditor.name} assigned.`;
    project.chainHash = chainResult.chainHash || project.chainHash;
    await project.save();

    return res.json({ msg: 'Auditor assigned on-chain and in MongoDB', project });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};
