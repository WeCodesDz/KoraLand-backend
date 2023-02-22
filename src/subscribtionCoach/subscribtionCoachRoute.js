const express = require('express');

const subscriptionCoachController = require('./subscribtionCoachModel');
const authController = require('../auth/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, subscriptionCoachController.saveSubscription)
  .delete(authController.protect, subscriptionCoachController.deleteSubscription);

module.exports = router;
