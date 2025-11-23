const Project = require('../models/Project');
const Credit = require('../models/Credit');
const { v4: uuidv4 } = require('uuid');
const blockchainService = require('../services/blockchainService'); // stub for now

exports.getAssigned = async (req,res)=>{
  try{
    const auditorId = req.user._id;
    const projects = await Project.find({ assignedAuditor: auditorId }).populate('owner','name email');
    res.json({ projects });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}

exports.approveProject = async (req,res)=>{
  try{
    const { projectId } = req.params;
    const project = await Project.findOne({ projectId });
    if(!project) return res.status(404).json({ msg:'Not found' });
    if(String(project.assignedAuditor) !== String(req.user._id)) return res.status(403).json({ msg:'Not assigned' });

    // Call blockchain service to mint credit / verify project
    // For now we call a stub that returns tokenId
    const tokenResult = await blockchainService.verifyAndMint(project.projectId, project.owner, project.creditsRequested);

    // Create credit entry in DB
    const credit = new Credit({
      creditId: 'CR-' + uuidv4(),
      project: project._id,
      owner: project.owner,
      amount: project.creditsRequested,
      tokenId: tokenResult.tokenId,
      status: 'Available'
    });
    await credit.save();

    project.status = 'Verified';
    project.chainHash = tokenResult.chainHash || '';
    await project.save();

    res.json({ msg:'Project approved and credits issued', credit });
  }catch(err){ console.error(err); res.status(500).json({ msg:'Server error', err:err.message }); }
}

exports.rejectProject = async (req,res)=>{
  try{
    const { projectId } = req.params;
    const { reason } = req.body;
    const project = await Project.findOne({ projectId });
    if(!project) return res.status(404).json({ msg:'Not found' });
    if(String(project.assignedAuditor) !== String(req.user._id)) return res.status(403).json({ msg:'Not assigned' });

    project.status = 'Rejected';
    await project.save();
    // Optionally notify user (notificationService)
    res.json({ msg:'Project rejected', reason });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}
