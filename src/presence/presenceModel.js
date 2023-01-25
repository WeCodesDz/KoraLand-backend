const Sequelize = require('sequelize');
const db = require('../../database');

const presence = db.define('presence', {
    datePresence:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    presence:{
        type: Sequelize.ENUM,
        values: ['present', 'absent'],
        defaultValue: 'absent',
    }

}, { timestamps: true });


module.exports = presence;