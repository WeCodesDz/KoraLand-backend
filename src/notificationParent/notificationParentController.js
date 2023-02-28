const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const NotificationParent = require('./notificationParentModel');
const Parent = require('../parent/parentModel');

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