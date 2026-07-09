const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  creditId: { type: String, required: true, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerWallet: { type: String, required: true },
  amount: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  listed: { type: Number, default: 0 },
  retired: { type: Number, default: 0 },
  tokenId: { type: String, required: true },
  txHash: { type: String, default: '' },
  status: { type: String, enum: ['Available', 'Listed', 'Sold', 'Retired'], default: 'Available' },
}, { timestamps: true });

module.exports = mongoose.model('Credit', creditSchema);
