const Sequelize = require('sequelize');
const db = require('../../database');

const presence = db.define('historique_presence', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        },
    datePresence:{
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    presence:{
        type: Sequelize.ENUM,
        values: ['present', 'absent'],
        defaultValue: 'absent',
    }

}, { timestamps: true });


module.exports = presence;