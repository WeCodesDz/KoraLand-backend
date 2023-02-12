const express = require('express');
const refreshAdminController = require('./refreshAdminController');
const router = express.Router();

router
    .get('/',refreshAdminController.handleAdminRefreshToken);

module.exports = router;