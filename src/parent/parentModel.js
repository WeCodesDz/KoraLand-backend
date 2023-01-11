const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../../database');

const parentModel = db.define('parent', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    nomParent: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    prenomParent: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    numeroTelephone: {
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
    status:{
        type: Sequelize.ENUM,
        values: ['actif', 'inactif'],
        allowNull: false,
    }

},{timestamps: true,
   });

   parentModel.prototype.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  

  
  module.exports = parentModel;