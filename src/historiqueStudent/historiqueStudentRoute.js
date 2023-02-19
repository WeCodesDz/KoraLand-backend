const express = require('express');
const router = express.Router();
const historiqueStudentController = require('./historiqueStudentController');

router.get('/', historiqueStudentController.getAllHistoriqueStudentsBySaison);

module.exports = router;