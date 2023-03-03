const webpush = require("web-push");
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const NotificationParent = require('./notificationParentModel');
const Parent = require('../parent/parentModel');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto: <contact@we-codes.com>",
  publicVapidKey,
  privateVapidKey
);
exports.sendPushNotificationToParent = async (parents, notification) => {
  try {
    const newParents = await Promise.all(
      parents.map(async (parent) => await Parent.findByPk(parent))
    );

    const parentsArraySubs = await Promise.all(
      newParents.map(
        async (parent) =>
          await parent.getSub({
            attributes: ["body"],
            raw: true,
          })
      )
    );
    const c = await Promise.all(
      parentsArraySubs.map(
        async (parentsSubs) =>
          await Promise.all(
            parentsSubs?.map(async (subscription) => {
              
              webpush
                .sendNotification(
                  subscription.body,
                  JSON.stringify(notification)
                )
                .catch((err) => {
                  console.error(err);
                });
            })
          )
      )
    );
  } catch (err) {
    console.error(err);
  }
};

exports.createNotificationParent = async (parents, notif) => {
  //we add validations after
  const notification = await NotificationParent.create(notif);

  await notification.setParents(parents);

  //return something
};

exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const parent = await Parent.findByPk(id);

    const notifications = await parent.getNotifications();
    if (!notifications) {
        throw new appError('No notifications found', 404);
    }
        
    res.status(200).json({
        status: 'success',
        body: notifications,
    });
});

exports.getNotificationById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const notification = await NotificationParent.findByPk(id);
    if (!notification) {
        throw new appError('No notification found with that ID', 404);
    }

    res.status(200).json({
        status: 'success',
        body: notification,
    });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const notification = await NotificationParent.findByPk(id);
    if (!notification) {
        throw new appError('No notification found with that ID', 404);
    }
    await notification.destroy();
    res.status(200).json({
        status: 'success',
        data: notification,
    });
});

exports.deleteAllMyNotifications = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const parent = await Parent.findByPk(id);
    await parent.setNotifications([]);
    
    res.status(200).json({
        status: 'success',
    });
});