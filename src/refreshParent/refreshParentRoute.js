const express = require('express');
const refreshParentController = require('./refreshParentController');
const router = express.Router();

router
    .get('/',refreshParentController.handleParentRefreshToken);

module.exports = router;