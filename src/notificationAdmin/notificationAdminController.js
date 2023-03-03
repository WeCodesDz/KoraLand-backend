const webpush = require("web-push");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const NotificationAdmin = require("./notificationAdminModel");
const Admin = require("../admin/adminModel");

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto: <contact@we-codes.com>",
  publicVapidKey,
  privateVapidKey
);
exports.sendPushNotificationToAdmin = async (admins, notification) => {
  try {
    const newAdmins = await Promise.all(
      admins.map(async (admin) => await Admin.findByPk(admin))
    );

    const adminsArraySubs = await Promise.all(
      newAdmins.map(
        async (admin) =>
          await admin.getSub({
            attributes: ["body"],
            raw: true,
          })
      )
    );
    const c = await Promise.all(
      adminsArraySubs.map(
        async (adminsSubs) =>
          await Promise.all(
            adminsSubs?.map(async (subscription) => {
              
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

exports.createNotificationAdmin = async (admins, notif) => {
  //we add validations after
  const notification = await NotificationAdmin.create(notif);

  await notification.setAdmins(admins);

  //return something
};

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const admin = await Admin.findByPk(id);

  console.log('----------------------------------------------------------------admin------')
  console.log(Object.getPrototypeOf(admin))
  console.log('----------------------------------------------------------------admin------')

  const notifications = await admin.getNotification_admins();
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
