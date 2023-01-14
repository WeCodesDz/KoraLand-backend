const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
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
        unique: { args: true, msg: 'Phone Number already in use!' },
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { args: true, msg: 'please provide a username!' },
          min: {
            args: 8,
            msg: 'Minimum 6 characters required in username',
          },
        },
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
    passwordConfirm: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        confirmPassword(value) {
          //console.log(value);
          if (!value) {
            throw new AppError('please confirm your password!', 400);
          }
          if (value !== this.password) {
            throw new AppError('both password are not match!', 400);
          }
        },
        min: {
          args: 8,
          msg: 'Minimum 8 characters required in password',
        },
        len: { args: [8, 255] },
      },
    },
    passwordChangedAt: {
      type: Sequelize.DATE,
    },
    passwordResetToken: {
      type: Sequelize.STRING,
      set(value) {
        this.setDataValue('passwordResetToken', value);
      },
    },
    passwordResetExpires: {
      type: Sequelize.DATE,
      set(value) {
        this.setDataValue('passwordResetExpires', value);
      },
    },
    status:{
        type: Sequelize.ENUM,
        values: ['actif', 'inactif'],
        defaultValue: 'actif',
        allowNull: false,
    },
    role:{
      type: Sequelize.ENUM,
      values:['parent'],
      allowNull:false
    }

},{timestamps: true,
  hooks:{
    afterValidate: async (parent) => {
      if (parent.passwordConfirm && parent.password) {
        //console.log(`parent.passwordConfirm: ${parent.passwordConfirm}`);
        if (parent.passwordConfirm !== parent.password) {
          throw new AppError('both password are not match!!!!!!!!!!', 400);
        }
        parent.password = await bcrypt.hash(parent.password, 12);
        // Delete passwordConfirm field
        parent.passwordConfirm = null;
      }
    },
  }
   });

   parentModel.prototype.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  

  
  module.exports = parentModel;