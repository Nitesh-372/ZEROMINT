const mongoose = require('mongoose');
const listingSchema = new mongoose.Schema({
  listingId: { type: String, unique: true },
  credit: { type: mongoose.Schema.Types.ObjectId, ref: 'Credit' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number },
  status: { type: String, enum: ['Open','Sold','Cancelled'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Listing', listingSchema);
