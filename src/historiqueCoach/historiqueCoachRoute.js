const express = require('express');
const historiqueCoachController = require('./historiqueCoachController');
const router = express.Router();

router.get('/',historiqueCoachController.getAllHistoriqueCoach);    

module.exports = router;