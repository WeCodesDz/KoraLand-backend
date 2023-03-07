const webpush = require("web-push");
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const NotificationCoach = require('./notificationCoachModel');
const Coach = require('../coach/coachModel');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto: <contact@we-codes.com>",
  publicVapidKey,
  privateVapidKey
);
exports.sendPushNotificationToCoach = async (coachs, notification) => {
  try {
    const newCoachs = await Promise.all(
      coachs.map(async (coach) => await Coach.findByPk(coach))
    );

    const coachsArraySubs = await Promise.all(
        newCoachs.map(
        async (coach) =>
          await coach.getSub({
            attributes: ["body"],
            raw: true,
          })
      )
    );
    const c = await Promise.all(
      coachsArraySubs.map(
        async (coachsSubs) =>
          await Promise.all(
            coachsSubs?.map(async (subscription) => {
              
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

exports.createNotificationCoach = async (coachs, notif) => {
  //we add validations after
  const notification = await NotificationCoach.create(notif);
  console.log(Object.getPrototypeOf(notification));
  await notification.setCoachs(coachs);

  //return something
  return notification;
};


exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const coach = await Coach.findByPk(id);

    const notifications = await coach.getNotifications_coachs();
    if (!notifications) {
        throw new appError('No notifications found', 404);
    }
        
    res.status(200).json({
        status: "success",
        data:{notifications} ,
    });
});

exports.getNotificationById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const notification = await NotificationCoach.findByPk(id);
    if (!notification) {
        throw new appError('No notification found with that ID', 404);
    }

    res.status(200).json({
        status: "success",
        data:{notification} ,
    });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const notification = await NotificationCoach.findByPk(id);
    if (!notification) {
        throw new appError('No notification found with that ID', 404);
    }
    await notification.destroy();
    res.status(200).json({
        status: 'success',
    });
});

exports.deleteAllMyNotifications = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const coach = await Coach.findByPk(id);
    await coach.setNotifications([]);
    
    res.status(200).json({
        status: 'success',
    });
});