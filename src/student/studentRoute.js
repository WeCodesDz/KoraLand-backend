const express = require('express');
const studentController = require('./studentController');
const authController = require('../auth/authController');
const router = express.Router();

router.use(authController.protect , authController.role('admin'));   
router
    .route('/')
    .get(
        studentController.getAllstudents)
    .post(studentController.createStudent);

router
      .route('/evaluations/:id')
      .get(studentController.getStudentEvaluation);

router
      .route('/inActifStudents')
      .get(
            authController.protect,
            authController.role('admin'),
            studentController.getBlockedStudents);
router
      .route('/presenceByDate/:id')
      .get(studentController.getStudentPresenceByDate);
router
      .route('/presence/:id')
      .get(studentController.getStudentAllPresence);
router
      .route('/lastEvaluation/:id')
      .get(studentController.lastEvaluation);
router
      .route('/blockStudent/:id')      
      .patch(studentController.blockStudent);

router
      .route('/payment/:id')      
      .get(studentController.getStudentPayment)
      .patch(studentController.updateStudentPayment);

router
      .route('/:id')
      .get(studentController.getStudentById)
      .patch(studentController.updateStudent)
      .delete(studentController.deleteStudent);
  
module.exports = router;