const express = require('express');
const coachController = require('./coachController');
const authController = require('../auth/authController');
const router = express.Router();


router
        .route('/')
        .post(coachController.createCoach)
        .get(
             authController.protect,   
             coachController.getAllcoachs);

router
        .route('/groups')
        .get(coachController.getCoachGroupes)
        .post(coachController.addCoachToGroupe)
        .delete(coachController.deleteCoachGroupe)

router.route('/:id')
        .get(coachController.getCoachById)
        .patch(coachController.updateCoach)
        .delete(coachController.deleteCoach);

 module.exports = router;