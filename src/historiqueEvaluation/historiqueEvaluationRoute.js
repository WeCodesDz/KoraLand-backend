const express = require('express');
const router = express.Router();
const historiqueEvaluationController = require('./historiqueEvaluationController');
const authController = require('../auth/authController');

router.get('/',authController.protect, authController.role('admin') ,historiqueEvaluationController.getHistoriqueOfEvaluationStudentBySaison);

module.exports = router;