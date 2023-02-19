const express = require('express');
const router = express.Router();
const historiquePresneceController = require('./historiquePresenceController');

router.get('/', historiquePresneceController.getHistoriqueOfPresneceStudentBySaison);

module.exports = router;