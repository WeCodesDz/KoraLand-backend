const express = require('express');
const router = express.Router();
const historiqueStudentController = require('./historiqueStudentController');
const authController = require('../auth/authController');

router.get('/', authController.protect, authController.role('admin') ,historiqueStudentController.getAllHistoriqueStudentsBySaison);

module.exports = router;