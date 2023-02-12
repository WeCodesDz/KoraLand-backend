const Sequelize = require('sequelize');
const db = require('../../database');

const refreshParent = db.define('refresh_parent', {
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


module.exports = refreshParent;