const catchAsync = require("../utils/catchAsync");
const AdminSubscription = require("./subscriptionAdminModel");
const Admin = require("../administrateur/administrateurModel");
const AppError = require("../utils/appError");

const Notf = require("../notificationAdmin/notificationAdminController");

exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.username) {
    throw new AppError("you must send a subscription and a username", 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const admin = await Admin.findOne({
    where: {
      username: req.body.username.trim(),
    },
  });
  if (!admin) {
    throw new AppError("user not found ", 404);
  }

  const newSubscription = await AdminSubscription.create({
    body: req.body.subscription,
  });

  await newSubscription.addSubs(admin);
  res.status(201).json({
    status: "success",
    data: {
      subscription: newSubscription,
    },
  });
});

exports.test = catchAsync(async (req, res, next) => {
  await Notf.sendPushNotificationToAdmin(
    ["16aa7a77-6966-4c74-92fb-cf7bf878c2a9"],
    { test: "test" }
  );
  res.json({ status: "success" });
});

exports.deleteSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription) {
    throw new AppError("you must send a subscription ", 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const sub = await AdminSubscription.findOne({
    where: {
      body: req.body.subscription,
    },
  });

  if (!sub) {
    throw new AppError("subscription not found", 404);
  }

  await sub.destroy();

  res.status(200).json({
    status: "success",
    message: "subscription deleted successfully",
  });
});
