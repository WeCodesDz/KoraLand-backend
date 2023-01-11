const Sequelize = require('sequelize');
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
        role:{
            type: Sequelize.ENUM,
            values: ['level2','level3', 'superadmin'],
            allowNull: true,
        }
    }, 
    {timestamps: false,});


module.exports = administrateurModel;

