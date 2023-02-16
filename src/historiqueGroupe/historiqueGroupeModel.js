const Sequelize = require('sequelize');
const db = require('../../database');

const historuiqueGroupeModel = db.define('historique_groupe', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    groupeName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    horaireEntrainement: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    sport:{
        type: Sequelize.ENUM,
        values: ['football', 'basketball'],
        allowNull: false,
    },
    categorieAge:{
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {timestamps: true,});

module.exports = historuiqueGroupeModel;