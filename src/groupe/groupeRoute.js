const express = require('express');
const studentModel = require('../student/studentModel');
const groupeController = require('./groupeController');
const authController = require('../auth/authController');

const router = express.Router();

router.use(authController.protect , authController.role('admin'));   

router.route('/')
    .get(groupeController.getAllGroupes)
    .post(groupeController.createGroupe);


    router
        .route('/students/')    
        .get(groupeController.getGroupeStudents)
        .post(groupeController.addStudentToGroupe)
        .delete(groupeController.deleteStudentGroupe);

       
router.route('/presnece/:id')
        .get(groupeController.getGroupePresenceByDate)


router.route('/:id')
        .get(groupeController.getGroupeById)
        .patch(groupeController.updateGroupe)
        .delete(groupeController.deleteGroupe);   

module.exports = router;