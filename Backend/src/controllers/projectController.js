const Project = require('../models/Project');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const blockchainService = require('../services/blockchainService');

function docId(value) {
  return String(value?._id || value || '');
}

function canSeeProject(user, project) {
  return Boolean(user);
}

function typeCode(type = 'OTH') {
  return String(type).replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'OTH';
}

function buildEvidenceSummary(files) {
  const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const hashInput = files.map((file) => `${file.originalName || file.filename}:${file.size || 0}`).join('|') || `${Date.now()}`;
  return {
    fileCount: files.length,
    totalBytes,
    evidenceHash: crypto.createHash('sha1').update(hashInput).digest('hex').slice(0, 10).toUpperCase(),
  };
}

exports.listProjects = async (req, res) => {
  try {
    const filter = (req.user.role === 'admin' || req.user.role === 'auditor')
      ? {}
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
    const files = (req.files || []).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `uploads/${file.filename}`,
      kind: file.fieldname,
      mimeType: file.mimetype,
      size: file.size,
    }));
    const evidenceSummary = buildEvidenceSummary(files);

    if (!type || !title || !creditsRequested || !ownerWallet) {
      return res.status(400).json({ msg: 'type, title, creditsRequested, and ownerWallet are required' });
    }

    const metadataURI = req.body.metadataURI || `mongodb://${req.user._id}/${evidenceSummary.evidenceHash}`;
    let chainResult = {
      onChainProjectId: undefined,
      chainHash: '',
      offline: true,
    };
    try {
      chainResult = await blockchainService.registerProjectOnChain({ ownerWallet, metadataURI, projectType: type, creditsRequested });
    } catch (err) {
      if (err.code !== 'BLOCKCHAIN_NOT_CONFIGURED') {
        return res.status(502).json({ msg: 'Blockchain registration failed', err: err.message });
      }
    }

    const project = await Project.create({
      projectId: `PRJ-${typeCode(type)}-${evidenceSummary.evidenceHash}-${files.length}-${uuidv4().slice(0, 6).toUpperCase()}`,
      onChainProjectId: chainResult.onChainProjectId,
      owner: req.user._id,
      ownerWallet,
      type,
      title,
      location,
      description,
      methodology,
      files,
      evidenceSummary,
      creditsRequested,
      chainHash: chainResult.chainHash,
      status: 'Pending',
      lastComment: chainResult.offline
        ? 'Project saved with evidence package. Blockchain is offline, so on-chain registration is pending.'
        : 'Project registered on-chain and pending auditor assignment.',
    });

    return res.status(201).json({
      msg: chainResult.offline ? 'Project created in demo mode' : 'Project created and registered on-chain',
      project,
    });
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
    let chainResult = { chainHash: '', offline: true };
    try {
      if (!project.onChainProjectId) {
        const err = new Error('Project is not registered on-chain yet');
        err.code = 'BLOCKCHAIN_NOT_CONFIGURED';
        throw err;
      }
      chainResult = await blockchainService.assignAuditor({ onChainProjectId: project.onChainProjectId, auditorWallet: auditor.walletAddress });
    } catch (err) {
      if (err.code !== 'BLOCKCHAIN_NOT_CONFIGURED') {
        return res.status(502).json({ msg: 'Blockchain auditor assignment failed', err: err.message });
      }
    }

    project.assignedAuditor = auditor._id;
    project.assignedAuditorWallet = auditor.walletAddress;
    project.status = 'Assigned';
    project.lastComment = chainResult.offline
      ? `Auditor ${auditor.name} assigned locally while blockchain is offline.`
      : `Auditor ${auditor.name} assigned.`;
    project.chainHash = chainResult.chainHash || project.chainHash;
    await project.save();

    return res.json({
      msg: chainResult.offline ? 'Auditor assigned locally' : 'Auditor assigned on-chain and in MongoDB',
      project,
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};
