const webpush = require("web-push");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const NotificationAdmin = require("./notificationAdminModel");
const Admin = require("../administrateur/administrateurModel");

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto: <contact@we-codes.com>",
  publicVapidKey,
  privateVapidKey
);
exports.sendPushNotificationToAdmin = async (admins, notification) => {
  try {
    console.log("------------------------------------------");
    console.log("------------------------------------------");
    console.log("----------aaaaaaaaaaaaaa--------------------------------");
    console.log(admins);
    console.log("-------------aaaaaaaaaaaa-----------------------------");
    console.log("------------------------------------------");
    console.log("------------------------------------------");
    const newAdmins = await Promise.all(
      admins.map(async (admin) => await Admin.findByPk(admin))
    );
    console.log("------------------------------------------");
    console.log("------------------------------------------");
    console.log("------------------------------------------");
    console.log(newAdmins);
    console.log("------------------------------------------");
    console.log("------------------------------------------");
    console.log("------------------------------------------");

    const adminsSubs = await Promise.all(
      newAdmins.map(
        async (admin) =>
          await admin.getSubs({
            attributes: ["body"],
            raw: true,
          })
      )
    );

    adminsSubs.forEach(async (subscription) => {
      webpush
        .sendNotification(subscription.body, JSON.stringify(notification))
        .catch((err) => {
          console.error(err);
        });
    });
  } catch (err) {
    console.error(err);
  }
};

exports.createNotificationAdmin = async (admins, notif) => {
  //we add validations after
  const notification = await NotificationAdmin.create(notif);

  await notification.setAdministrateurs(admins);

  //return something
};

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const admin = await Admin.findByPk(id);

  const notifications = await admin.getNotifications();
  if (!notifications) {
    throw new appError("No notifications found", 404);
  }

  res.status(200).json({
    status: "success",
    body: notifications,
  });
});

exports.getNotificationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const notification = await NotificationAdmin.findByPk(id);
  if (!notification) {
    throw new appError("No notification found with that ID", 404);
  }

  res.status(200).json({
    status: "success",
    body: notification,
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const notification = await NotificationAdmin.findByPk(id);
  if (!notification) {
    throw new appError("No notification found with that ID", 404);
  }
  await notification.destroy();
  res.status(200).json({
    status: "success",
    data: notification,
  });
});

exports.deleteAllMyNotifications = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const admin = await Admin.findByPk(id);
  await admin.setNotifications([]);

  res.status(200).json({
    status: "success",
  });
});
