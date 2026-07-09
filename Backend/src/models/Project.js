const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  onChainProjectId: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerWallet: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  methodology: { type: String, default: '' },
  files: [{ filename: String, path: String, hash: String, kind: String }],
  assignedAuditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAuditorWallet: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Assigned', 'Need More Info', 'Verified', 'Rejected', 'Minted', 'Resubmit'],
    default: 'Pending',
  },
  creditsRequested: { type: Number, default: 0 },
  creditsApproved: { type: Number, default: 0 },
  chainHash: { type: String, default: '' },
  approvalHash: { type: String, default: '' },
  lastComment: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
