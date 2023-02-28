const catchAsync = require('../utils/catchAsync');
const AdminSubscription = require('./subscribtionAdminModel');
const Admin = require('../administrateur/administrateurModel');
const AppError = require('../utils/appError');

exports.saveSubscription = catchAsync(async (req, res, next) => {
  if (!req.body.subscription || !req.body.username) {
    throw new AppError('you must send a subscription and a username', 400);
  }
  //const subscription = JSON.parse(req.body.subscription);

  const  admin = await Admin.findOne({
    where:{
        username: req.body.username.trim()
    }
});
  if (!admin) {
    throw new AppError('user not found ', 404);
  }

  

  const newSubscription = await AdminSubscription.create({
    body: req.body.subscription
  });

  await newSubscription.addAdministrateur(admin);
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

  const sub = await AdminSubscription.findOne({
    where: {
      body: req.body.subscription,
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
