const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const auditorController = require('../controllers/auditorController');

router.get('/assigned', protect, auditorController.getAssigned);
router.post('/:projectId/approve', protect, auditorController.approveProject);
router.post('/:projectId/reject', protect, auditorController.rejectProject);
router.post('/:projectId/more-info', protect, auditorController.requestMoreInfo);

module.exports = router;
