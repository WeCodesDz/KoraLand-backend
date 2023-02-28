const express = require('express');
const router = express.Router();
const notificationAdminController = require('./notificationAdminController');
const authController = require('../auth/authController');

router.use(authController.protect);

router.get('/', notificationAdminController.getMyNotifications);
router.get('/:id', notificationAdminController.getNotificationById);
router.delete('/:id', notificationAdminController.deleteNotification);
router.delete('/', notificationAdminController.deleteAllMyNotifications);

module.exports = router;