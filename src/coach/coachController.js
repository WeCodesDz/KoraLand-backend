const sequelize = require('sequelize'); 
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Coach = require('./coachModel');
const Groupe = require('../groupe/groupeModel');
const Student = require('../student/studentModel');
const HistoriqueCoach = require('../historiqueCoach/historiqueCoachModel');
const coachModel = require('../historiqueCoach/historiqueCoachModel');

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
      if (['username'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });
  
    return where;
  };

exports.createCoach = catchAsync(async (req, res, next) => {
    const {
        nomCoach,
        prenomCoach,
        email,
        username,
        password,
        passwordConfirm,
    } = req.body;
    
    if(!nomCoach || !prenomCoach || !email || !username || !password || !passwordConfirm ) {
        throw new  AppError('Please provide all fields', 400);
    }
    
    const coach = await Coach.create({
        nomCoach,
        prenomCoach,
        email,
        username,
        password,
        passwordConfirm,
        role:'coach'
    });
    await HistoriqueCoach.create({
        nomCoach,
        prenomCoach,
        email,
        username,
        password,
        passwordConfirm,
        role:'coach'
    });
    coach.password = undefined;
    coach.passwordConfirm = undefined;
    coach.passwordChangedAt = undefined;
    coach.passwordResetToken = undefined;
    coach.passwordResetExpires = undefined;
    res.status(201).json({
        status: 'success',
        data: {
            coach
        },
    });
});

exports.getAllcoachs = catchAsync(async (req, res, next) => {
    let { page, limit } = req.query;
  page = page * 1 || 1;
  limit = limit * 1 || 100;
  // offset is the number of rows skipped
  const offset = (page - 1) * limit;
  let results;
  //filtering
  const where = filter(req.query);
  //console.log(req.user.adminLevel)
  //here we should test the admin role before setting the attributs (only super admin can see the phone number)
  if(req.user.adminLevel === 'superadmin'){
     results = await Coach.findAndCountAll({
        attributes:['id','nomCoach','prenomCoach','email','username'],
        where,
        limit,
        offset,
      });
  }
  if(req.user.adminLevel === 'level2' || req.user.adminLevel === 'level3'){
     results = await Coach.findAndCountAll({
        attributes:['id','nomCoach','prenomCoach','email','username'],
        where,
        limit,
        offset,
      });
  }
  res.status(200).json({
    status: 'succes',
    rows: results.length,
    data: {
      totalPages: Math.ceil(results.count / limit),
      page,
      limit,
      rows: results.rows.length,
      totalCoachs: results.rows,
    },
  });
});

exports.getCoachById = catchAsync(async (req, res, next) => {
  let coach;
  if(req.user.adminLevel === 'superAdmin'){
     coach = await Coach.findByPk(req.params.id,{
        attributes:['id','nomCoach','prenomCoach','email',,'username'],
     });
  }
  if(req.user.adminLevel === 'level2' || req.user.adminLevel === 'level3'){
     coach = await Coach.findByPk(req.params.id,{
        attributes:['id','nomCoach','prenomCoach','email','username'],
     });
  }
  
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
        coach,
        },
    });
});

exports.updateCoach = catchAsync(async (req, res, next) => {
    const coach = await Coach.findByPk(req.params.id);
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    
    const {
        nomCoach,
        prenomCoach,
        email,
        username,
    } = req.body;

    if(nomCoach) coach.nomCoach = nomCoach;
    if(prenomCoach) coach.prenomCoach = prenomCoach;
    if(email) coach.email = email;
    if(username) coach.username = username;

    await coach.save();
    res.status(200).json({
        status: 'success',
        data: {
        coach,
        },
    });
});

exports.deleteCoach = catchAsync(async (req, res, next) => {
    const coach = await Coach.findByPk(req.params.id);
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    coach.destroy();
    res.status(200).json({
        status: 'success',
        data: coach,
    });
});

exports.getCoachGroupes = catchAsync(async (req, res, next) => {
    const coach = await Coach.findByPk(req.query.id,{
        attributes:['id','nomCoach','prenomCoach','username'],
    });
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    const groupes = await coach.getGroupes();
    if (!groupes) {
        throw new  AppError('No groupes found with this Coach', 404);
    }
    res.status(200).json({
        status: 'success',
        data:{
          ...coach.dataValues,
          groupes
        }
    });
});

exports.addCoachToGroupe = catchAsync(async (req, res, next) => {
    const coach = await Coach.findByPk(req.body.coachId);
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    const groupe = await Groupe.findByPk(req.body.groupeId);
    if (!groupe) {
        throw new  AppError('No groupe found with that ID', 404);
    }
    await coach.addGroupe(groupe);
    res.status(200).json({
        status: 'success',
        data: {
          coach,
          groupe
        }
    });
});


exports.deleteCoachGroupe = catchAsync(async (req, res, next) => {
    const coach = await Coach.findByPk(req.body.coachId);
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    const groupe = await Groupe.findByPk(req.body.groupeId);
    if (!groupe) {
        throw new  AppError('No groupe found with that ID', 404);
    }
    await coach.removeGroupe(groupe);
    res.status(200).json({
        status: 'success',
    });
});

exports.getMyGroupes = catchAsync(async (req, res, next) => {
    const coachId = req.user.id;
    const coach = await Coach.findByPk(coachId,{
        attributes:['id','nomCoach','prenomCoach','email','username'],
    });
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    const groupes = await coach.getGroupes();
    if (!groupes) {
        throw new  AppError('No groupes found with this Coach', 404);
    }
    const groupesIds = groupes.map(groupe => groupe.id);
    const groupesStats = await Groupe.findAll({
        where:{
            id:groupesIds
        },
        attributes:['id','groupeName','horaireEntrainement','sport','categorieAge','saisonActuel'],
        include:[{
            model:Student,
            attributes:[
                'nomEleve',
                'prenomEleve',
                'commune',
                'posteEleve',
            ]
        }]
    });
    groupesStats.forEach(groupe => {
        groupe.dataValues.count_players = groupe.dataValues.students.length;
    });
  
    res.status(200).json({
        status: 'success',
        data:{
          ...coach.dataValues,
          groupes:groupesStats
        }
    });
});

exports.getMyGroupeById = catchAsync(async (req, res, next) => {
    const coachId = req.user.id;
    const coach = await Coach.findByPk(coachId,{
        attributes:['id','nomCoach','prenomCoach','email','username'],
    });
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    // const groupes = await Groupe.findOne({
    //     where:{
    //         id:req.params.id,
    //         coachId:coach.id
    //     }   
    // });
    const groupes = await coach.getGroupes({
        where:{
            id:req.params.id
        }
    })
    if (!groupes) {
        throw new  AppError('No groupes found with this Coach', 404);
    }
    res.status(200).json({
        status: 'success',
        data:{
          ...coach.dataValues,
          groupes
        }
    });
});

exports.getListStudentOfOneGroupe = catchAsync(async (req, res, next) => {
    const coachId = req.user.id;
    const coach = await Coach.findByPk(coachId,{
        attributes:['id','nomCoach','prenomCoach','email','username'],
    });
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    const groupe = await Groupe.findOne({
        where:{
            id:req.params.id.trim(),
            coachId:coachId
        },
        include:{
            model:Student,
            attributes:[
            'id',
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'anneeExamen',
            'sport',
            'commune',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',],
        },
    });
    
    res.status(200).json({
        status: 'success',
        data:{
          ...coach.dataValues,
          ...groupe.dataValues,
        }
    });
});

exports.getMyGroupesStudents = catchAsync(async (req, res, next) => {
    const coachId = req.user.id;
    const coach = await Coach.findByPk(coachId,{
        attributes:['id','nomCoach','prenomCoach','email','username'],
    });
    if (!coach) {
        throw new  AppError('No coach found with that ID', 404);
    }
    const groupes = await coach.getGroupes();
    if (!groupes) {
        throw new  AppError('No groupes found with this Coach', 404);
    }
    const groupesIds = groupes.map(groupe => groupe.id);
    const groupesStats = await Groupe.findAll({
        where:{
            id:groupesIds
        },
        attributes:['id','groupeName','horaireEntrainement','saisonActuel'],
        include:{
            model:Student,
            attributes:[
            'id',
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'anneeExamen',
            'sport',
            'commune',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',],
        },
    });
    groupesStats.forEach(groupe => {
        groupe.dataValues.count_players = groupe.dataValues.students.length;
    });
    res.status(200).json({
        status: 'success',
        data:{
          ...coach.dataValues,
          groupes:groupesStats
        }
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {

    const coach = await Coach.findOne({
      where: {
        id: req.user.id,
      },
      attributes: ['id', 'password'],
    });
  
    if (
      !(await coach.correctPassword(
        req.body.passwordCurrent.trim(),
        coach.password
      ))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  
    coach.password = req.body.password;
    coach.passwordConfirm = req.body.passwordConfirm;
  
    await coach.save();
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  });