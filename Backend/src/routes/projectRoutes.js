const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

router.get('/', protect, projectController.listProjects);
router.get('/auditors', protect, projectController.listAuditors);
router.get('/assigned', protect, projectController.getAssignedProjects);
router.post('/', protect, upload.array('files', 10), projectController.createProject);
router.get('/:projectId', protect, projectController.getProject);
router.post('/:projectId/hire-auditor', protect, projectController.hireAuditor);

module.exports = router;
