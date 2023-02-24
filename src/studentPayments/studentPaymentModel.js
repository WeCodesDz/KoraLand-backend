const Sequelize = require('sequelize');
const db = require('../../database');

const paymentModel = db.define('payment', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    status:{
        type: Sequelize.ENUM,
        values: ['oui', 'non', 'avance','abandonne'],
        allowNull: false,
    },
    mantant:{
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    saisonActuel:{
        type: Sequelize.STRING,
        allowNull: false,
    }

},{timestamps: true
   });


  module.exports = paymentModel;