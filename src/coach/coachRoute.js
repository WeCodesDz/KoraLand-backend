const express = require('express');
const coachController = require('./coachController');
const authController = require('../auth/authController');
const router = express.Router();

router.use(authController.protect);   
router
        .route('/')
        .post(authController.role('admin'),coachController.createCoach)
        .get(
             authController.role('admin'),   
             coachController.getAllcoachs);

router
        .route('/groups')
        .get(authController.role('admin'),coachController.getCoachGroupes)
        .post(authController.role('admin'),coachController.addCoachToGroupe)
        .delete(authController.role('admin'),coachController.deleteCoachGroupe);

router
        .route('/myGroupes/')
        .get(authController.protect, coachController.getMyGroupes);
router
        .route('/myGroupes/:id')
        .get(authController.protect, coachController.getMyGroupeById);
router
        .route('/myGroupeStudent/:id')
        .get(authController.protect, coachController.getListStudentOfOneGroupe);


router.route('/:id')
        .get(authController.role('admin'),coachController.getCoachById)
        .patch(authController.role('admin'),coachController.updateCoach)
        .delete(authController.role('admin'),coachController.deleteCoach);

 module.exports = router;