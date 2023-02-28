const Sequelize = require('sequelize');
const db = require('../../database');

const NotificationParent = db.define(
  'notification_parent',
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
        values: ['evaluation','message'],
        allowNull: false,
        validate: {notNull: { args: true, msg: 'please provide a type!' },}
    
    }
    
    
  },
  {
    timestamps: true,
  }
);

module.exports = NotificationParent;
