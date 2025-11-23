const Project = require('../models/Project');
const { v4: uuidv4 } = require('uuid');

exports.createProject = async (req,res)=>{
  try{
    const ownerId = req.user._id;
    const { type, title, description, creditsRequested } = req.body;
    const files = (req.files || []).map(f => ({ filename: f.filename, path: f.path }));
    const projectId = 'PRJ-' + uuidv4();
    const proj = new Project({
      projectId, owner: ownerId, type, title, description, files, creditsRequested
    });
    await proj.save();

try {
    const ownerWallet = req.body.ownerWallet;
    const ipfsHash = "ipfs://dummy";  // or actual if you have
    const credits = req.body.creditsRequested || 0;

    await blockchainService.registerProjectOnChain(
        proj.projectId,
        ownerWallet,
        ipfsHash,
        Number(credits)
    );
} catch (err) {
    console.log("Blockchain error:", err);
}

return res.json({
    msg: "Project created & registered on blockchain",
    project: proj
});


exports.getAssignedProjects = async (req,res)=>{
  try{
    const auditorId = req.user._id;
    const projects = await Project.find({ assignedAuditor: auditorId }).populate('owner','name email');
    res.json({ projects });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}
const User = require('../models/User');

exports.hireAuditor = async (req,res)=>{
  try{
    const { projectId } = req.params;
    const { auditorId } = req.body;
    const project = await Project.findOne({ projectId });
    if(!project) return res.status(404).json({ msg:'Project not found' });
    // only owner or admin can hire
    if(String(project.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ msg:'Not authorized' });
    }
    const auditor = await User.findById(auditorId);
    if(!auditor || auditor.role !== 'auditor') return res.status(400).json({ msg:'Invalid auditor' });
    project.assignedAuditor = auditor._id;
    project.status = 'Assigned';
    await project.save();
    return res.json({ msg:'Auditor assigned', project });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}
