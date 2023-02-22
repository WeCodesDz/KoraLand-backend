const catchAsync = require('../util/catchAsync');
const ParentSubscription = require('./subscribtionParentModel');
const Parent = require('../parent/parentModel');
const AppError = require('../util/appError');

exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.parentId) {
    throw new AppError('you must send a subscription and a user id', 400);
  }
  const subscription = JSON.parse(req.body.subscription);

  const parent = await Parent.findByPk(req.body.parentId);
  if (!parent) {
    throw new AppError('user not found ', 404);
  }

  const sub = await ParentSubscription.findOne({
    where: {
      endpoint: subscription.endpoint,
    },
  });
  if (sub) {
    await sub.destroy();
  }

  const newSubscription = await ParentSubscription.create({
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys_Auth: subscription.keys.auth,
    keys_p256dh: subscription.keys.p256dh,
  });

  newSubscription.addParent(req.body.parentId);
  res.status(201).json({
    status: 'success',
    data: {
      newSubscription,
    },
  });
});

exports.deleteSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription) {
    throw new AppError('you must send a subscription ', 400);
  }
  const subscription = JSON.parse(req.body.subscription);

  const sub = await ParentSubscription.findOne({
    where: {
      endpoint: subscription.endpoint,
    },
  });

  if (!sub) {
    throw new AppError('subscription not found', 404);
  }

  await sub.destroy();

  res.status(200).json({
    message: 'Parent deleted successfully',
  });
});
