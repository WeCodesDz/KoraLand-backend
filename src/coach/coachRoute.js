const express = require('express');
const coachController = require('./coachController');
const router = express.Router();


router.route('/')
        .post(coachController.createCoach)
        .get(coachController.getAllCoach);


router.route('/:id')
        .get(coachController.getCoachById)
        .patch(coachController.updateCoach)
        .delete(coachController.deleteCoach);