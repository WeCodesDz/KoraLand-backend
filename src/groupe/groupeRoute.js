const express = require('express');
const studentModel = require('../student/studentModel');
const groupeController = require('./groupeController');

const router = express.Router();

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