const express = require('express');
const router = express.Router();
const historiqueGroupeController = require('./historiqueGroupeController');
const authController = require('../auth/authController');

router.get('/',authController.protect, authController.role('admin') ,historiqueGroupeController.getAllHistoriqueGroupe);

module.exports = router;