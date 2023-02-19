const express = require('express');
const router = express.Router();
const historiqueGroupeController = require('../controllers/historiqueGroupeController');

router.get('/', historiqueGroupeController.getAllHistoriqueGroupe);

module.exports = router;