const webpush = require("web-push");
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const NotificationCoach = require('./notificationCoachModel');
const Coach = require('../coach/coachModel');
const {sendFCMNotification} = require("../firebase/sendNotification");

exports.sendPushNotificationToCoach = async (coachs, notification) => {
  try {
    const newCoachs = await Promise.all(
      coachs.map(async (coach) => await Coach.findByPk(coach))
    );

    const coachsArraySubs = await Promise.all(
        newCoachs.map(
        async (coach) =>
          await coach.getSub({
            attributes: ["token"],
            raw: true,
          })
      )
    );
    const subs = coachsArraySubs.flat();
    const tokens = subs.map((sub) => sub.token);
    const notif = await sendFCMNotification(tokens, notification);
    return notif;
  
  } catch (err) {
    console.error(err);
  }
};

exports.createNotificationCoach = async (coachs, notif) => {
  //we add validations after
  const notification = await NotificationCoach.create(notif);
  console.log(Object.getPrototypeOf(notification));
  await notification.setCoaches(coachs);

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