const Listing = require('../models/Listing');
const Credit = require('../models/Credit');
const blockchainService = require('../services/blockchainService');

exports.getCredits = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const credits = await Credit.find(filter).populate('project', 'projectId title type location onChainProjectId').populate('owner', 'name email walletAddress');
    return res.json({ credits });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'Open' })
      .populate({ path: 'credit', populate: { path: 'project', select: 'projectId title type location onChainProjectId' } })
      .populate('seller', 'name email walletAddress');
    return res.json({ listings });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.listCredit = async (req, res) => {
  try {
    const { creditId, price } = req.body;
    const amount = Number(req.body.amount || 0);
    const credit = await Credit.findOne({ creditId });
    if (!credit) return res.status(404).json({ msg: 'Credit not found' });
    if (String(credit.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Not owner' });
    if (!amount || amount <= 0 || amount > credit.available) return res.status(400).json({ msg: 'Invalid listing amount' });
    if (!price || Number(price) <= 0) return res.status(400).json({ msg: 'Invalid price' });

    const listing = await Listing.create({
      listingId: `LST-${Date.now()}`,
      credit: credit._id,
      seller: credit.owner,
      sellerWallet: credit.ownerWallet,
      amount,
      price: Number(price),
      status: 'Open',
    });

    credit.available -= amount;
    credit.listed += amount;
    credit.status = credit.available > 0 ? 'Listed' : 'Listed';
    await credit.save();

    return res.status(201).json({ msg: 'Listed', listing, credit });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.buyListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findOne({ listingId }).populate('credit');
    if (!listing || listing.status !== 'Open') return res.status(404).json({ msg: 'Listing not available' });
    if (String(listing.seller) === String(req.user._id)) return res.status(400).json({ msg: 'Seller cannot buy own listing' });

    const sourceCredit = await Credit.findById(listing.credit._id);
    let chainResult;
    try {
      chainResult = await blockchainService.transferCredits({ fromWallet: sourceCredit.ownerWallet, toWallet: req.user.walletAddress, tokenId: sourceCredit.tokenId, amount: listing.amount });
    } catch (err) {
      return res.status(502).json({ msg: 'Blockchain credit transfer failed', err: err.message });
    }
    sourceCredit.listed = Math.max(0, sourceCredit.listed - listing.amount);
    sourceCredit.status = sourceCredit.available > 0 || sourceCredit.listed > 0 ? (sourceCredit.listed > 0 ? 'Listed' : 'Available') : 'Sold';
    await sourceCredit.save();

    const buyerCredit = await Credit.create({
      creditId: `CR-${Date.now()}`,
      project: sourceCredit.project,
      owner: req.user._id,
      ownerWallet: req.user.walletAddress,
      amount: listing.amount,
      available: listing.amount,
      tokenId: sourceCredit.tokenId,
      txHash: chainResult.chainHash || sourceCredit.txHash,
      status: 'Available',
    });

    listing.status = 'Sold';
    listing.buyer = req.user._id;
    listing.buyerWallet = req.user.walletAddress;
    await listing.save();

    return res.json({ msg: 'Purchased', credit: buyerCredit, listing });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.retireCredit = async (req, res) => {
  try {
    const { creditId } = req.params;
    const amount = Number(req.body.amount || 0);
    const credit = await Credit.findOne({ creditId });
    if (!credit) return res.status(404).json({ msg: 'Credit not found' });
    if (String(credit.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Not owner' });
    if (!amount || amount <= 0 || amount > credit.available) return res.status(400).json({ msg: 'Invalid retirement amount' });

    let chainResult;
    try {
      chainResult = await blockchainService.retireCredits({ ownerWallet: credit.ownerWallet, tokenId: credit.tokenId, amount });
    } catch (err) {
      return res.status(502).json({ msg: 'Blockchain retirement failed', err: err.message });
    }

    credit.available -= amount;
    credit.retired += amount;
    credit.txHash = chainResult.chainHash || credit.txHash;
    credit.status = credit.available === 0 && credit.listed === 0 ? 'Retired' : credit.status;
    await credit.save();

    return res.json({ msg: 'Credits retired', credit, certificate: { amount, beneficiary: req.body.beneficiary || req.user.name, retiredAt: new Date() } });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

