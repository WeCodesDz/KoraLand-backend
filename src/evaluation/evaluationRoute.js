const express = require('express');
const evaluationController = require('./evaluationController');
const router = express.Router();


router
    .route('/lastEvaluation/:id')
    .get(evaluationController.getStudentLastEvaluation);

router  
    .route('/:id')
    .post(evaluationController.createStudentEvaluation)
    .get(evaluationController.getStudentEvaluationByDateEvaluation);      

module.exports = router;
