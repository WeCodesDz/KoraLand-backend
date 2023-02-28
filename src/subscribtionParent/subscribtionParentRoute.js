const express = require('express');

const subscriptionParentController = require('./subscribtionParentController');
const authController = require('../auth/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, subscriptionParentController.saveSubscription)
  .delete(authController.protect, subscriptionParentController.deleteSubscription);

module.exports = router;
