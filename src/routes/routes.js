const express = require('express');
const router = express.Router();
const controller = require('../controllers/controllers');
const auth = require('../controllers/auth');

router.get('/', controller.getHome);
router.post('/api/login', auth.login);
router.post('/api/register', auth.register);
router.get('/api/profile', auth.verifyToken, controller.getProfile);
router.post('/api/profile', auth.verifyToken, controller.updateProfile);
router.get('/api/verify', auth.verifyToken, controller.verify);
router.post('/api/challenge1/addNote', auth.verifyToken, controller.addNote);
router.get('/api/challenge1/getNote', auth.verifyToken, controller.getNote);
router.get('/api/scores', auth.verifyToken, controller.getScores);
router.post('/api/admin/updateStatus', auth.verifyToken, controller.updateUserStatus);
router.post('/api/profile/upload', auth.verifyToken, controller.uploadProfileImage);
router.get('*', controller.get404);

module.exports = router;