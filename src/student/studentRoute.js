const express = require('express');
const studentController = require('./studentController');
const router = express.Router();

router.route('/')
    .get(studentController.getAllstudents)
    .post(studentController.createStudent);

router.route('/:id')
      .get(studentController.getStudentById)
      .patch(studentController.updateStudent)
      .delete(studentController.deleteStudent);
  
module.exports = router;