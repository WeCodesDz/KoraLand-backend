const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const db = require('../../database');

const administrateurModel = db.define('administrateur', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        },
        nomAdmin: {
        type: Sequelize.STRING,
        allowNull: false,
        },
        prenomAdmin: {
        type: Sequelize.STRING,
        allowNull: false,
        },
        email:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: { args: true, msg: 'Email address already in use!' },
        validate: {
          isEmail: true,
          notNull: { args: true, msg: 'Email Required' },
                  },
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
        role:{
          type:Sequelize.ENUM,
          values:['admin'],
          allowNull:false
        },
        adminLevel:{
            type: Sequelize.ENUM,
            values: ['level2','level3','superadmin'],
            allowNull: true,
        }
    }, 
    {timestamps: false,
    hooks:{
      afterValidate: async (administrateur) => {
        if (administrateur.passwordConfirm && administrateur.password) {
          //console.log(`administrateur.passwordConfirm: ${administrateur.passwordConfirm}`);
          if (administrateur.passwordConfirm !== administrateur.password) {
            throw new AppError('both password are not match!!!!!!!!!!', 400);
          }
          administrateur.password = await bcrypt.hash(administrateur.password, 12);
          administrateur.passwordConfirm = null;

        }

      },
    }
    });

administrateurModel.prototype.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
module.exports = administrateurModel;

