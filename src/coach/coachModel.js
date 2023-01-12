const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
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
        unique: { args: true, msg: 'Phnoe Number already in use!' },
    },
    email: {
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
    categories:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    role:{
      type: Sequelize.ENUM,
      values:['coach'],
      allowNull:false

    },
}, {timestamps: true,
  hooks:{
    afterValidate: async (coach) => {
      if (coach.passwordConfirm && coach.password) {
        //console.log(`coach.passwordConfirm: ${coach.passwordConfirm}`);
        if (coach.passwordConfirm !== coach.password) {
          throw new AppError('both password are not match!!!!!!!!!!', 400);
        }
        coach.password = await bcrypt.hash(coach.password, 12);
        // Delete passwordConfirm field
        coach.passwordConfirm = null;
      }
    },
  }
});

coachModel.prototype.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
module.exports = coachModel;