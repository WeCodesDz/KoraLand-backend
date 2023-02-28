const Sequelize = require('sequelize');
const db = require('../../database');

const NotificationCoach = db.define(
  'notification_coach',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type:  Sequelize.STRING,
      allowNull: false, validate: {
      notNull: { args: true, msg: 'please provide a title!' },}
    },
    desc: {
      type:  Sequelize.STRING,
      allowNull: false, validate: {
      notNull: { args: true, msg: 'please provide a description!' },}
    },
    type:{
     
        type: Sequelize.ENUM,
        values: ['evaluation'],
        allowNull: false,
        validate: {notNull: { args: true, msg: 'please provide a type!' },}
    
    }
    
    
  },
  {
    timestamps: true,
  }
);

module.exports = NotificationCoach;
