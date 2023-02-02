const express = require('express');
const parentController = require('./parentController');
const authController = require('../auth/authController');

const router = express.Router();

router
    .route('/')
    .get(
          authController.protect,
          parentController.getAllParents)
    .post(parentController.createParent);

router
    .route('/myStudents')
    .get(
            authController.protect, 
            parentController.getMyStudents);

router
    .route('/student/:id')
    .post(parentController.addStudentToParent)
    .get(parentController.getParentAllStudent);     

router
    .route('/:id')
    .get(parentController.getParentbyId)
    .patch(parentController.updateParent)
    .delete(parentController.deleteParent);    

module.exports = router;