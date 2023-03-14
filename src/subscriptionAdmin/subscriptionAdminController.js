const catchAsync = require("../utils/catchAsync");
const AdminSubscription = require("./subscriptionAdminModel");
const Admin = require("../admin/adminModel");
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
    token: req.body.subscription,
  });

  await newSubscription.addSub(admin);
  res.status(201).json({
    status: "success",
    data: {
      subscription: newSubscription,
    },
  });
});

exports.test = catchAsync(async (req, res, next) => {
  
    notification = {
       title : "FCM IS COOL !",
       body : "Notification has been recieved",
       content_available : "true",
       image:"https://i.ytimg.com/vi/iosNuIdQoy8/maxresdefault.jpg",
       link: "https://www.google.com"
    }
 
  await Notf.sendPushNotificationToAdmin(
    ["53553fad-7bfc-4dfb-896f-cb52ff70a832"],
    notification
  );
  await Notf.createNotificationAdmin(["53553fad-7bfc-4dfb-896f-cb52ff70a832"],
  { 
    title: notification.title,
    desc: notification.body,
    type: "message",
  });
  res.json({ status: "success" });
});

exports.deleteSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription) {
    throw new AppError("you must send a subscription ", 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const sub = await AdminSubscription.findOne({
    where: {
      token: req.body.subscription,
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
