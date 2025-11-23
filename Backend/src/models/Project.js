const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true }, // generate server-side
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  files: [{ filename: String, path: String, hash: String }],
  assignedAuditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Draft','Pending','Assigned','Verified','Rejected','Resubmit'], default: 'Pending' },
  creditsRequested: { type: Number, default: 0 },
  chainHash: { type: String, default: '' }, // on-chain evidence hash
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
