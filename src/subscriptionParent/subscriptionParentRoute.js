const express = require('express');

const subscriptionParentController = require('./subscriptionParentController');
const authController = require('../auth/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, subscriptionParentController.saveSubscription)
  .get(authController.protect, subscriptionParentController.test)
  .delete(authController.protect, subscriptionParentController.deleteSubscription);

module.exports = router;
