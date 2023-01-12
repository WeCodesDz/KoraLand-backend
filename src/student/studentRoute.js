const express = require('express');
const studentController = require('./studentController');
const authController = require('../auth/authController');
const router = express.Router();

router.route('/')
    .get(
        authController.protect,
        authController.role('admin'),
        studentController.getAllstudents)
    .post(studentController.createStudent);

router.route('/:id')
      .get(studentController.getStudentById)
      .patch(studentController.updateStudent)
      .delete(studentController.deleteStudent);
  
module.exports = router;