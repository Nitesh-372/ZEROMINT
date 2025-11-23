const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  creditId: { type: String, required: true, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 },
  tokenId: { type: String }, // on-chain token id
  status: { type: String, enum: ['Available','Listed','Sold','Retired'], default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Credit', creditSchema);
