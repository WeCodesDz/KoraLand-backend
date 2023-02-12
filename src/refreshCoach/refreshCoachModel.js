const Sequelize = require('sequelize');
const db = require('../../database');

const refreshCoach = db.define('refresh_coach', {
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


module.exports = refreshCoach;