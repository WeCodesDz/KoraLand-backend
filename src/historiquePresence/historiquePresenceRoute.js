const express = require('express');
const historiquePresneceController = require('./historiquePresenceController');
const authController = require('../auth/authController');
const router = express.Router();

router.get('/',authController.protect, authController.role('admin') ,historiquePresneceController.getHistoriqueOfPresneceStudentBySaison);

module.exports = router;