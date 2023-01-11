const Sequelize = require('sequelize');
const db = require('../../database');

const coachModel = db.define('coach', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    nomCoach: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    prenomCoach: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    numeroTelephone: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'please provide a password!' },
            min: {
              args: 8,
              msg: 'Minimum 8 characters required in password',
            },
            len: {
              args: [8, 255],
              msg: 'password must be between 8 and 32 caractere',
            },
          },
    },
    categories:{
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {timestamps: true,});

module.exports = coachModel;