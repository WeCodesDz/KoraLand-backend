const express = require('express');
const refreshCoachController = require('./refreshCoachController');
const router = express.Router();

router
    .get('/',refreshCoachController.handleCoachRefreshToken);

module.exports = router;