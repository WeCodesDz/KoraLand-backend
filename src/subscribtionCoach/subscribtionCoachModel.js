const Sequelize = require('sequelize');
const db = require('../../database');

const subscriptionCoach = db.define(
  'subscription_coach',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    body: {
      type: Sequelize.DataTypes.JSONB,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = subscriptionCoach;
