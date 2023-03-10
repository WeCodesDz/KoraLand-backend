const catchAsync = require('../utils/catchAsync');
const CoachSubscription = require('./subscriptionCoachModel');
const Coach = require('../coach/coachModel');
const AppError = require('../utils/appError');

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
  

 await newSubscription.addCoach(coach);
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
