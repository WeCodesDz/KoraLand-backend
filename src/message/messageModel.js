const Sequelize = require('sequelize');
const db = require('../../database');

const Message = db.define('refresh_coach', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        },
    body:{
        type: Sequelize.TEXT,
        allowNull: false,
    },

}, { timestamps: true });


module.exports = Message;