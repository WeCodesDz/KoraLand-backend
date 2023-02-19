const express = require('express');
const router = express.Router();
const historiqueEvaluationController = require('./historiqueEvaluationController');

router.get('/', historiqueEvaluationController.getHistoriqueOfEvaluationStudentBySaison);

module.exports = router;