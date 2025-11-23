const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const marketplaceController = require('../controllers/marketplaceController');

router.post('/list', protect, marketplaceController.listCredit);
router.post('/buy/:listingId', protect, marketplaceController.buyListing);

module.exports = router;
