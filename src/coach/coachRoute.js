const express = require('express');
const coachController = require('./coachController');
const authController = require('../auth/authController');
const router = express.Router();


router.route('/')
        .post(coachController.createCoach)
        .get(coachController.getAllcoachs);


router.route('/:id')
        .get(coachController.getCoachById)
        .patch(coachController.updateCoach)
        .delete(coachController.deleteCoach);

        module.exports = router;