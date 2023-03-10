const admin = require('firebase-admin');

//firebase settings
const  serviceAccount = require('./kora-land-b04dc-firebase-adminsdk-u7uks-f810fb286d.json');

exports.init = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
};