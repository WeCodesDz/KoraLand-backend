const webpush = require("web-push");
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const NotificationParent = require('./notificationParentModel');
const Parent = require('../parent/parentModel');
const {sendFCMNotification} = require("../firebase/sendNotification");

exports.sendPushNotificationToParent = async (parents, notification) => {
  try {
    const newParents = await Promise.all(
      parents.map(async (parent) => await Parent.findByPk(parent))
    );

    const parentsArraySubs = await Promise.all(
      newParents.map(
        async (parent) =>
          await parent.getSub({
            attributes: ["token"],
            raw: true,
          })
      )
    );
    const subs = parentsArraySubs.flat();
    const tokens = subs.map((sub) => sub.token);
    const notif = await sendFCMNotification(tokens, notification);
    return notif;
    
  } catch (err) {
    console.error(err);
  }
};

exports.createNotificationParent = async (parents, notif) => {
  //we add validations after
  const notification = await NotificationParent.create(notif);

  await notification.setParents(parents);

  //return something
  return notification;
};

exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const parent = await Parent.findByPk(id);

    const notifications = await parent.getNotification_parents();
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
        data: notification,
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

exports.sendMessageToAllParents= catchAsync(async (req,res,next)=>{
  const {message} = req.body;
  const nodeEventEmitter = req.app.get('nodeEventEmitter')
  if (nodeEventEmitter) {
    nodeEventEmitter.emit(
      "send_message_to_all_parents",
      {message,admin:req.user}
    );
    nodeEventEmitter.on(
      "message_sent_to_all_parents",
      (data) => {
        if (data.status === "success"){
          res.status(200).json({
            status: 'success',
        });
        }
        if(data.status === "error"){
          throw new appError('something went wrong',500);
        }
      }
      );
    }
    
    throw new appError('something went wrong',500);
})
