const express = require('express');
const studentModel = require('../student/studentModel');
const groupeController = require('./groupeController');
const authController = require('../auth/authController');

const router = express.Router();

router.use(authController.protect);   

router.route('/')
    .get(authController.role('admin'),groupeController.getAllGroupes)
    .post(authController.role('admin'),groupeController.createGroupe);


    router
        .route('/students/')    
        .get(authController.role('admin','coach'),groupeController.getGroupeStudents)
        .post(authController.role('admin'),groupeController.addStudentToGroupe)
        .delete(authController.role('admin'),groupeController.deleteStudentGroupe);

router
      .get('/getstudents/:id',authController.protect , authController.role('coach'),groupeController.getGroupeStudentById);

router.route('/presnece/:id')
        .get(authController.role('admin','coach'),groupeController.getGroupePresenceByDate)
router.route('/allPresence/:id')
        .get(authController.role('admin','coach'),groupeController.getAllGroupePresences)


router.route('/:id')
        .get(authController.role('admin'),groupeController.getGroupeById)
        .patch(authController.role('admin'),groupeController.updateGroupe)
        .delete(authController.role('admin'),groupeController.deleteGroupe);   

module.exports = router;