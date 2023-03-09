const Sequelize = require('sequelize');
const db = require('../../database');

const Message = db.define('message', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        },
    subjectId:{
        type: Sequelize.STRING,
        allowNull: false,
    },      
    subject:{
        type: Sequelize.STRING,
        allowNull: false,
    },      
    body:{
        type: Sequelize.TEXT,
        allowNull: false,
    },

}, { timestamps: true });


module.exports = Message;