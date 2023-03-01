const express = require("express");

const subscriptionAdminController = require("./subscriptionAdminController");
const authController = require("../auth/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.protect, subscriptionAdminController.saveSubscription)
  .get(authController.protect, subscriptionAdminController.test)
  .delete(
    authController.protect,
    subscriptionAdminController.deleteSubscription
  );

module.exports = router;
