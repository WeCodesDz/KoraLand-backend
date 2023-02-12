const Sequelize = require('sequelize');
const db = require('../../database');

const refreshAdmin = db.define('refresh_admin', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        },
    jwt:{
        type: Sequelize.STRING,
        allowNull: false,
    }

}, { timestamps: true });


module.exports = refreshAdmin;