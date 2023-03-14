const webpush = require("web-push");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const NotificationAdmin = require("./notificationAdminModel");
const Admin = require("../admin/adminModel");

const {sendFCMNotification} = require("../firebase/sendNotification");


exports.sendPushNotificationToAdmin = async (admins, notification) => {
  try {
    const newAdmins = await Promise.all(
      admins.map(async (admin) => await Admin.findByPk(admin))
    );
    const adminsArraySubs = await Promise.all(
      newAdmins.map(
        async (admin) =>
          await admin.getSub({
            attributes: ["token"],
            raw: true,
          })
      )
    );
    const subs = adminsArraySubs.flat();
    const payload = { 
      notification : {
         title : notification.title,
         body : notification.desc,
         content_available : "true",
         
      }
   }
    const tokens = subs.map((sub) => sub.token);
    const notif = await sendFCMNotification(tokens, payload);
    return notif;
  } catch (err) {
    console.error(err);
  }
};

exports.createNotificationAdmin = async (admins, notif) => {

    const notification = await NotificationAdmin.create(notif);
    await notification.setAdmins(admins);

  return notification;
  //return something
};

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const admin = await Admin.findByPk(id);

  // console.log('----------------------------------------------------------------admin------')
  // console.log(Object.getPrototypeOf(admin))
  // console.log('----------------------------------------------------------------admin------')

  const notifications = await admin.getNotification_admins({
    order: [["createdAt", "DESC"]],
  });
  if (!notifications) {
    throw new appError("No notifications found", 404);
  }
  const nombre_notifications = notifications.length;
  res.status(200).json({
    status: "success",
    data:{
      nombre_notifications,
      notifications,

    } ,
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
    data: notification,
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
