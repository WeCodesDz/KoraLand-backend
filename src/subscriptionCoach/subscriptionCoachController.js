const catchAsync = require('../utils/catchAsync');
const CoachSubscription = require('./subscriptionCoachModel');
const Coach = require('../coach/coachModel');
const AppError = require('../utils/appError');
const Notf = require("../notificationCoach/notificationCoachController");


exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.username) {
    throw new AppError('you must send a subscription and a username', 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const coach = await Coach.findOne({
    where:{
        username: req.body.username.trim()
    }
});
  if (!coach) {
    throw new AppError('user not found ', 404);
  }

 

  const newSubscription = await CoachSubscription.create({
    token: req.body.subscription
  });
  
 await newSubscription.addSub(coach);
  res.status(201).json({
    status: 'success',
    data: {
      subscription:newSubscription,
    },
  });
});

exports.test = catchAsync(async (req, res, next) => {
  const payload = { 
    notification : {
       title : "FCM IS COOL !",
       body : "Notification has been recieved",
       image:"https://i.ytimg.com/vi/iosNuIdQoy8/maxresdefault.jpg"
    }
 }
  await Notf.sendPushNotificationToCoach(
    ["e13bb688-1dc2-4bd5-ad78-40ab41e84063"],
    payload
  );
  await Notf.createNotificationCoach(["e13bb688-1dc2-4bd5-ad78-40ab41e84063"],
  { 
    title: payload.notification.title,
    desc: payload.notification.body,
    type: "message",
  });
  res.json({ status: "success" });
});


exports.deleteSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription) {
    throw new AppError('you must send a subscription ', 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const sub = await CoachSubscription.findOne({
    where: {
      token: req.body.subscription,
    },
  });

  if (!sub) {
    throw new AppError('subscription not found', 404);
  }

  await sub.destroy();

  res.status(200).json({
    status: 'success',
    message: 'subscription deleted successfully',
  });
});
