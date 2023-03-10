const { getMessaging } = require('firebase-admin/messaging');

exports.sendFCMNotification = async(tokens, notification) =>{
    try {   
        const message = await getMessaging().sendToDevice(tokens, notification);
        return message;
    } catch (e) {
        console.error('sendFCMMessage error', e);
    }
}