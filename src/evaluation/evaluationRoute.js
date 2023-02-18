const express = require('express');
const evaluationController = require('./evaluationController');
const authController = require('../auth/authController');
const router = express.Router();

router.use(authController.protect);

router
    .route('/allEvaluations/')
    .get(authController.role('coach','admin'),evaluationController.getAllStudentEvaluation);

router
    .route('/handleEvaluation/:id')
    .patch(authController.role('admin'),evaluationController.handleEvaluation);
router  
    .route('/:id')
    .post(authController.role('coach'),evaluationController.createStudentEvaluation)
    .get(authController.role('coach','admin'),evaluationController.getStudentEvaluationByDateEvaluation);      

module.exports = router;
