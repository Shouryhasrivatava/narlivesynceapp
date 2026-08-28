const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/guest', authController.guestLogin);
router.get('/presets', authController.getPresets);

module.exports = router;
