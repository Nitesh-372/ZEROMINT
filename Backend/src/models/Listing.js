const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  listingId: { type: String, required: true, unique: true },
  credit: { type: mongoose.Schema.Types.ObjectId, ref: 'Credit', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerWallet: { type: String, required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerWallet: { type: String, default: '' },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  txHash: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'Sold', 'Cancelled'], default: 'Open' },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
