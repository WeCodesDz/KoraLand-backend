const express = require('express');
const studentController = require('./studentController');
const authController = require('../auth/authController');
const router = express.Router();

router.use(authController.protect , authController.role('admin'));   
router
    .route('/')
    .get(
      authController.role('admin'),
        studentController.getAllstudents)
    .post(authController.role('admin'),studentController.createStudent);

router
      .route('/evaluations/:id')
      .get(authController.role('admin'),studentController.getStudentEvaluation);

router
      .route('/inActifStudents')
      .get(
            authController.protect,
            authController.role('admin'),
            studentController.getBlockedStudents);
router
      .route('/presenceByDate/:id')
      .get(authController.role('admin','coach'),studentController.getStudentPresenceByDate);
router
      .route('/presence/:id')
      .get(authController.role('admin','coach'),studentController.getStudentAllPresence);
router
      .route('/lastEvaluation/:id')
      .get(authController.role('admin'),studentController.lastEvaluation);
router
      .route('/blockStudent/:id')      
      .patch(authController.role('admin'),studentController.blockStudent);

// router
//       .route('/payment/:id')      
//       .get(studentController.getStudentPayment)
//       .patch(studentController.updateStudentPayment);

router
      .route('/:id')
      .get(authController.role('admin'),studentController.getStudentById)
      .patch(authController.role('admin'),studentController.updateStudent)
      .delete(authController.role('admin'),studentController.deleteStudent);
  
module.exports = router;