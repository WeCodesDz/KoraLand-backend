const catchAsync = require('../util/catchAsync');
const AdminSubscription = require('./subscriptionModel');
const Admin = require('../administrateur/administrateurModel');
const AppError = require('../util/appError');

exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.adminId) {
    throw new AppError('you must send a subscription and a user id', 400);
  }
  const subscription = JSON.parse(req.body.subscription);

  const admin = await Admin.findByPk(req.body.adminId);
  if (!admin) {
    throw new AppError('user not found ', 404);
  }

  const sub = await AdminSubscription.findOne({
    where: {
      endpoint: subscription.endpoint,
    },
  });
  if (sub) {
    await sub.destroy();
  }

  const newSubscription = await AdminSubscription.create({
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys_Auth: subscription.keys.auth,
    keys_p256dh: subscription.keys.p256dh,
  });

  newSubscription.addAdmin(req.body.adminId);
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

  const sub = await AdminSubscription.findOne({
    where: {
      endpoint: subscription.endpoint,
    },
  });

  if (!sub) {
    throw new AppError('subscription not found', 404);
  }

  await sub.destroy();

  res.status(200).json({
    message: 'Admin deleted successfully',
  });
});
