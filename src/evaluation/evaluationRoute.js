const express = require('express');
const evaluationController = require('./evaluationController');
const router = express.Router();


router
    .route('/allEvaluations/')
    .get(evaluationController.getAllStudentEvaluation);

router  
    .route('/:id')
    .post(evaluationController.createStudentEvaluation)
    .get(evaluationController.getStudentEvaluationByDateEvaluation);      

module.exports = router;
