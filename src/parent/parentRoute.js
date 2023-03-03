const express = require('express');
const parentController = require('./parentController');
const authController = require('../auth/authController');

const router = express.Router();
router.use(authController.protect);   
router
    .route('/')
    .get(
        authController.role('admin'),
          parentController.getAllParents)
    .post(authController.role('admin'),parentController.createParent);

router.patch('/update_my_password', parentController.updatePassword);

router
    .route('/myStudents')
    .get(parentController.getMyStudents);

router  
    .route('/myStudents/:id')
    .get(parentController.getParentStudentById); 

router.use(authController.role('admin'));    
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