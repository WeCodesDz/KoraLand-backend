const express = require('express');
const router = express.Router();
const notificationParentController = require('./notificationParentController');
const authController = require('../auth/authController');

router.use(authController.protect);

router.get('/', notificationParentController.getMyNotifications);
router.get('/:id', notificationParentController.getNotificationById);
router.delete('/:id', notificationParentController.deleteNotification);
router.delete('/', notificationParentController.deleteAllMyNotifications);

module.exports = router;