const express = require('express');
const messageController = require('./messageController');
const authController = require('../auth/authController');

const router = express.Router();

router.route('/').get(authController.protect,
                      authController.role('admin','parent'),
                      messageController.getAllMessagesByRoom);

module.exports = router;