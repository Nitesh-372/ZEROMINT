const Listing = require('../models/Listing'); // create Listing model below
const Credit = require('../models/Credit');

exports.listCredit = async (req,res)=>{
  try{
    const { creditId, price } = req.body;
    const credit = await Credit.findOne({ creditId });
    if(!credit) return res.status(404).json({ msg:'Credit not found' });
    if(String(credit.owner) !== String(req.user._id)) return res.status(403).json({ msg:'Not owner' });

    const listing = new Listing({
      listingId: 'LST-' + Date.now(),
      credit: credit._id,
      seller: req.user._id,
      price,
      status: 'Open'
    });
    await listing.save();
    credit.status = 'Listed';
    await credit.save();
    res.json({ msg:'Listed', listing });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}

exports.buyListing = async (req,res)=>{
  try{
    const { listingId } = req.params;
    const listing = await Listing.findOne({ listingId }).populate('credit');
    if(!listing || listing.status !== 'Open') return res.status(404).json({ msg:'Listing not available' });

    // Simulate token transfer: in real, call blockchain marketplace
    // Transfer ownership in DB
    const credit = await Credit.findById(listing.credit._id);
    credit.owner = req.user._id;
    credit.status = 'Sold';
    await credit.save();
    listing.status = 'Sold';
    listing.buyer = req.user._id;
    await listing.save();
    res.json({ msg:'Purchased', credit });
  }catch(err){ res.status(500).json({ msg:'Server error' }); }
}
