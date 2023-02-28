const express = require('express');
const router = express.Router();
const notificationCoachController = require('./notificationCoachController');
const authController = require('../auth/authController');

router.use(authController.protect);

router.get('/', notificationCoachController.getMyNotifications);
router.get('/:id', notificationCoachController.getNotificationById);
router.delete('/:id', notificationCoachController.deleteNotification);
router.delete('/', notificationCoachController.deleteAllMyNotifications);

module.exports = router;