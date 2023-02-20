const express = require('express');
const historiqueCoachController = require('./historiqueCoachController');
const authController = require('../auth/authController');
const router = express.Router();

router.get('/',authController.protect, authController.role('admin'),historiqueCoachController.getAllHistoriqueCoach);    

module.exports = router;