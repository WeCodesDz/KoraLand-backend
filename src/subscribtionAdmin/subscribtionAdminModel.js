const Sequelize = require('sequelize');
const db = require('../../database');

const SubscriptionAdmin = db.define(
  'subscription_admin',
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

module.exports = SubscriptionAdmin;
