const sequelize = require('sequelize');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Groupe = require('./groupeModel');
const Student = require('../student/studentModel');
const Coach = require('../coach/coachModel');
const Presence = require('../presence/presenceModel');
const HistoriqueGroupe = require('../historiqueGroupe/historiqueGroupeModel');
const HistoriqueCoach = require('../historiqueCoach/historiqueCoachModel');

const filter = (queryParams) => {
    const tempQueryParams = { ...queryParams };
  
    const keys = Object.keys(queryParams);
    keys.forEach((key) => {
      if (key !== key.trim()) {
        tempQueryParams[key.trim()] = tempQueryParams[key].trim();
        delete tempQueryParams[key];
      } else {
        tempQueryParams[key] = tempQueryParams[key].trim();
      }
    });
  
    const queryObj = { ...tempQueryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);
  
  
    const queryArray = Object.entries(queryObj);
  
    const where = {};
  
    queryArray.forEach((obj) => {
      if (['categorieAge','username'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });
    return where;
  };

exports.createGroupe = catchAsync(async (req, res, next) => {
    const {
        groupeName,
        horaireEntrainement,
        sport,
        categorieAge,
        saisonActuel,
        coachId
    } = req.body;
    
    if(!groupeName || !horaireEntrainement || !sport || !categorieAge || !coachId) {
        throw new  AppError('Please provide all fields', 400);
    }
    
    const groupe = await Groupe.create({
        groupeName,
        horaireEntrainement,
        sport,
        saisonActuel,
        categorieAge
    });

    //coachAffected here if exist
    await groupe.setCoach(coachId);

    const coach = await Coach.findByPk(coachId);
    const historiqueCoach = await HistoriqueCoach.findOne({
      where:{
        username : coach.username
      }
    });
    await HistoriqueGroupe.create({
      groupeName,
      horaireEntrainement,
      sport,
      saisonActuel,
      categorieAge,
      historiqueCoachId:historiqueCoach.id
    });
    // await historiqueGroupe.setHistoriqueCoach(historiqueCoach.id);
    res.status(201).json({
        status: 'success',
        data: {
        groupe,
        },
    });
});

exports.getAllGroupes = catchAsync(async (req, res, next) => {
    let { page, limit } = req.query;
    page = page * 1 || 1;
    limit = limit * 1 || 100;
    // offset is the number of rows skipped
    const offset = (page - 1) * limit;
    //filtering
    const where = filter(req.query);
    const results = await Groupe.findAll({ 
        attributes: ['id', 'groupeName','saisonActuel','horaireEntrainement', 'sport', 'categorieAge'],
        where,
        limit,
        offset,
        include: [
          {
            model: Student, 
          },
          {
            model: Coach,
            attributes: ['id', 'username', 'nomCoach', 'prenomCoach', 'email'],
          }
        ],
     });
      results.forEach((groupe) => {
      studentCount = groupe.dataValues.students?.length;
      groupe.dataValues.studentsCount = studentCount;
     });
    res.status(200).json({
        status: 'success',
    data: {
      totalPages: Math.ceil(results.count / limit),
      page,
      limit,
      rows: results?.length,
      totalGroupes: results,
    },
    });
});

exports.getGroupeById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const groupe = await Groupe.findByPk(id,{
        attributes: ['id', 'groupeName','saisonActuel','horaireEntrainement', 'sport', 'categorieAge','coachId']
    });
    if (!groupe) {
        throw new  AppError('No groupe found with that ID', 404);
    }
    const coach = await groupe.getCoach({
        attributes: ['id', 'username', 'nomCoach', 'prenomCoach', 'email']
    });
    groupe.coachId = undefined;
    res.status(200).json({
        status: 'success',
        data:{
            ...groupe.dataValues,
            coach
        }
    });
});

exports.updateGroupe = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // const { groupeName, horaireEntrainement, sport, categorieAge } = req.body;
    const groupe = await Groupe.findByPk(id);
    if (!groupe) {
      throw new  AppError('No groupe found with that ID', 404);
    }
    await groupe.update(req.body);
    //update list des students ET coach
    res.status(200).json({
      status: 'success',
      data: {
        groupe,
      },
    });
  });

exports.deleteGroupe = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const groupe = await Groupe.findByPk(id);
    if (!groupe) {
      throw new  AppError('No groupe found with that ID', 404);
    }
    await groupe.destroy();
    res.status(200).json({
      status: 'success',
      data: groupe,
    });
  });    

exports.addStudentToGroupe = catchAsync( async(req, res, next)=>{
  const groupe = await Groupe.findByPk(req.body.groupeId.trim());
  if(!groupe){
    throw new  AppError('No groupe found with that ID', 404);
  }

  const student = await Student.findByPk(req.body.studentId.trim());
  if(!student){
    throw new  AppError('No student found with that ID', 404);
  }

  await groupe.addStudent(student);
  res.status(200).json({
    status: 'success',
  });

});

exports.getGroupeStudents = catchAsync( async(req, res, next)=>{
  const groupe = await Groupe.findByPk(req.query.groupeId.trim());
  if(!groupe){
    throw new  AppError('No groupe found with that Id', 404);
  }

  const students = await groupe.getStudents({
    include: [
      {
        model: Presence,
        order:[['createdAt', 'DESC']],
      }
    ]
  });
  if(!students){
    throw new  AppError('No students found in this groupe', 404);
  }
  res.status(200).json({
    status: 'success',
    data:{
      ...groupe.dataValues,
      students
    }
  });
});


exports.deleteStudentGroupe = catchAsync( async(req, res, next)=>{
  const groupe = await Groupe.findByPk(req.body.groupeId.trim());
  if(!groupe){
    throw new  AppError('No groupe found with that Id', 404);
  }

  const student = await Student.findByPk(req.body.studentId.trim());
  if(!student){
    throw new  AppError('No student found with that Id', 404);
  }

  await groupe.removeStudent(student);
  res.status(200).json({
    status: 'success',
  });
});

exports.getGroupePresenceByDate = catchAsync(async(req,res,next)=>{
    const {datePresence} = req.query;
    const groupe = await Groupe.findOne({
        where:{
            id:req.params.id
        }
    });
    const presence = await groupe.getPresences({
      where:{
        datePresence
      },
      include:[{
        model:Student,
        attributes:['id','nomEleve','prenomEleve','posteEleve','taille','poids']
      },
      {
        model:Groupe,
        attributes:['id','groupeName','horaireEntrainement', 'categorieAge']  
      }]
    });
    presence.createdAt = undefined;
    presence.updatedAt = undefined;
    presence.groupeId = undefined;
    presence.studentId = undefined;
    presence.id = undefined;

    res.status(200).json({
      status: 'success',
      data: presence,
    });
    
});

exports.getGroupeStudentById = catchAsync(async(req,res,next)=>{
  const groupe = await Groupe.findByPk(req.params.id.trim());
  if(!groupe){
    throw new  AppError('No groupe found with that Id', 404);
  }

  const student = await Student.findOne({
    attributes:['id','nomEleve','prenomEleve','dateNaissance','saisonActuel','commune','guardianDeBut','posteEleve','taille','poids'],
    where:{
      id:req.query.studentId,
      groupeId:groupe.id
    }
  })
  if(!student){
    throw new  AppError('No student found in this groupe with this Id', 404);
  }
  res.status(200).json({
    status: 'success',
    data:{
      student
    }
  });
})

exports.getAllGroupePresences = catchAsync(async(req,res,next)=>{
  const groupe = await Groupe.findByPk(req.params.id.trim());
  if(!groupe){
    throw new  AppError('No groupe found with that Id', 404);
  }
  const nombreSeance = await groupe.getPresences({
    attributes: [
      "datePresence",
     [sequelize.fn("COUNT", sequelize.col("id")), "count_players"],  
    ],
    group: ['datePresence'],
    order : [['datePresence', 'ASC']] 
  });
  const nombreAbsence = await groupe.getPresences({
    attributes: [
      "datePresence",
      [sequelize.fn("COUNT", sequelize.col("presence")), "count_absence"],
    ],
    where:{
      presence:'absent'
    },
    group: ['datePresence'],
    order : [['datePresence', 'ASC']]
  });
  const nombrePresence = await groupe.getPresences({
    attributes: [
      "datePresence",
      [sequelize.fn("COUNT", sequelize.col("presence")), "count_presence"],
    ],
    where:{
      presence:'present'
    },
    group: ['datePresence'],
    order : [['datePresence', 'ASC']]
  });
  if(!nombreSeance){
    throw new  AppError('No presences found in this groupe', 404);
  }
  res.status(200).json({
    status: 'success',
    data:{
      ...groupe.dataValues,
      nombreSeance,
      nombreAbsence,
      nombrePresence
    }
  });
});