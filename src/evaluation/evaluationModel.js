const Sequelize = require('sequelize');
const db = require('../../database');

const evaluation = db.define('evaluation', {
    id: {
        type: Sequelize.Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    //physique
    vitesse30m1:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    coordination1:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    souplesse1:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    endurance1:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    force1:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    vitesse30m2:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    coordination2:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    souplesse2:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    endurance2:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    force2:{
        type: Sequelize.BOOLEAN,
        allowNull:false,
    },
    // technique
    jonglerie:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    conduitDeBalleEnSlalom:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    qualiteDePasse:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    controleDeBalle:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    controleOrionte:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    precisionDeTir:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    passeCourte:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    passeLongue:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    dribble:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    piedFaible:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    jeuxDeTete:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    tackle:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    coupsFrancCourts:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    coupsFrancLongs:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    corners:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    penalty:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    // mental
    confienceEnSoi:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    concentration:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    attitude:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    aggrisiveSaine:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    combativite:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    collectif:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    motivationPersonnelle:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    timidite:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    //tactique
    comportementOffensif:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    comportementDefensive:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    duel:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    inteligenceDansLeJeu:{
        type: Sequelize.ENUM,
        values:['A','NA','ECA'],
        allowNull:false,
    },
    dateEvaluation:{
        type: Sequelize.STRING,
        allowNull:false,
    },
    etatEvaluation:{
        type: Sequelize.ENUM,
        values:['accepted','waiting','blocked'],
        defaultValue:'waiting',
        allowNull:false,
    }
    
},{timestamps: true});


module.exports = evaluation;