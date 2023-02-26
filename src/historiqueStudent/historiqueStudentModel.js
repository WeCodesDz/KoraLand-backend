const { Sequelize } = require("sequelize");
const db = require("../../database");

const studentModel = db.define("historique_student", {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    operateur:{
        type: Sequelize.STRING,
        allowNull: false,
    }, 
    nomEleve: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    prenomEleve: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    dateNaissance: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    saisonActuel: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    dateInscription:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    sport:{
        type: Sequelize.ENUM,
        values: ['football', 'basketball'],
        allowNull: { args: true, msg: 'You should insert sport for the student!' },
    },
    reinscription:{
        type: Sequelize.ENUM,
        values: ['oui', 'nouveau'],
        allowNull: false,
    },
    numeroTelephone:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: { args: true, msg: 'Phone Number already in use!' },
    },
    anneeExamen:{
        type: Sequelize.STRING,
        allowNull: true,
    },
    commune:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    guardianDeBut:{
        type: Sequelize.ENUM,
        values: ['oui', 'non'],
        allowNull: false,
    },
    posteEleve:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    taille:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    poids:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    remarque:{
        type: Sequelize.TEXT,
        allowNull: false,
    },
    status:{
        type: Sequelize.ENUM,
        values: ['actif', 'inactif'],
        defaultValue: 'actif',
        allowNull: false,
    },
},{
    timestamps: true
});

module.exports = studentModel;