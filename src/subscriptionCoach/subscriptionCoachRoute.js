const express = require('express');

const subscriptionCoachController = require('./subscriptionCoachController');
const authController = require('../auth/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, subscriptionCoachController.saveSubscription)
  .get(authController.protect, subscriptionCoachController.test)
  .delete(authController.protect, subscriptionCoachController.deleteSubscription);

module.exports = router;
