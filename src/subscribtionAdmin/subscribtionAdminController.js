const catchAsync = require('../util/catchAsync');
const AdminSubscription = require('./subscriptionModel');
const Admin = require('../administrateur/administrateurModel');
const AppError = require('../util/appError');

exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.username) {
    throw new AppError('you must send a subscription and a username', 400);
  }
  const subscription = JSON.parse(req.body.subscription);

  const  admin = await Admin.findOne({
    where:{
        username: req.body.username.trim()
    }
});
  if (!admin) {
    throw new AppError('user not found ', 404);
  }

  

  const newSubscription = await AdminSubscription.create({
    body: subscription
  });

  await newSubscription.addAdmin(admin);
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
