const catchAsync = require('../utils/catchAsync');
const ParentSubscription = require('./subscriptionParentModel');
const Notf = require('../notificationParent/notificationParentController')
const Parent = require('../parent/parentModel');
const AppError = require('../utils/appError');


exports.test = catchAsync(async (req, res, next) => {
  await Notf.sendPushNotificationToParent(
    ["24da984c-76e5-4d05-ada0-068976957dce"],
    { test: "test" }
  );
  await Notf.createNotificationParent(["24da984c-76e5-4d05-ada0-068976957dce"],
  { 
    title: "test",
    desc: "test",
    type: "message",
  });
  res.json({ status: "success" });
});

exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.username) {
    throw new AppError('you must send a subscription and a username', 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const parent = await Parent.findOne({
    where:{
        username: req.body.username.trim()
    }
});
  if (!parent) {
    throw new AppError('user not found ', 404);
  }


  const newSubscription = await ParentSubscription.create({
    token: req.body.subscription
  });

 await newSubscription.addParent(parent);
  res.status(201).json({
    status: 'success',
    data: {
      subscription:newSubscription,
    },
  });
});

exports.deleteSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription) {
    throw new AppError('you must send a subscription ', 400);
  }
 // const subscription = JSON.parse(req.body.subscription);

  const sub = await ParentSubscription.findOne({
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
