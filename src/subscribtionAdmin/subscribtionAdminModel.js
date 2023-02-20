const Sequelize = require('sequelize');
const db = require('../../database');

const subscriptionAdmin = db.define(
  'subscription_admin',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    endpoint: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { args: false, msg: 'Required' },
      },
    },
    expirationTime: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    keys_Auth: {
      type: Sequelize.STRING,
    },
    keys_p256dh: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = subscriptionAdmin;
