const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

router.post('/', protect, upload.array('files', 10), projectController.createProject);

module.exports = router;
router.post('/:projectId/hire-auditor', protect, projectController.hireAuditor);
