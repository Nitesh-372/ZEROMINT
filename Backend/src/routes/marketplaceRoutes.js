const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const marketplaceController = require('../controllers/marketplaceController');

router.get('/credits', protect, marketplaceController.getCredits);
router.get('/listings', protect, marketplaceController.getListings);
router.post('/list', protect, marketplaceController.listCredit);
router.post('/buy/:listingId', protect, marketplaceController.buyListing);
router.post('/credits/:creditId/retire', protect, marketplaceController.retireCredit);

module.exports = router;
