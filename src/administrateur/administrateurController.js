const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Admin = require('./administrateurModel');
const Student = require('../student/studentModel');
const Presence = require('../presence/presenceModel');
const sequelize = require('sequelize');

exports.getAllAdmin = catchAsync(async (req, res, next) => {
  const admins = await Admin.findAll({
    attributes:[
      'id',
      'nomAdmin',
        'prenomAdmin',
        'email',
        'username',
        'adminLevel',
        'role',]
  });
  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins,
    },
  });
});

exports.getAdminById = catchAsync(async (req, res, next) => {
    const admin = await Admin.findByPk(req.params.id,{
        attributes:['nomAdmin',
            'prenomAdmin',
            'email',
            'numeroTelephone',
            'username',
            'adminLevel',
            'role',]
      });
    if (!admin) {
        throw new AppError('No admin found with that ID', 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
        admin,
        },
    });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
    const {
        nomAdmin,
        prenomAdmin,
        email,
        username,
        password,
        passwordConfirm,
        role,
        adminLevel
    } = req.body;
    
    if(!nomAdmin || !prenomAdmin || !email || !username || !password || !passwordConfirm || !role || !adminLevel) {
        throw new  AppError('Please provide all fields', 400);
    }
    
    const admin = await Admin.create({
        nomAdmin:nomAdmin.trim(),
        prenomAdmin:prenomAdmin.trim(),
        email:email.trim(),
        username:username.trim(),
        password:password.trim(),
        passwordConfirm:passwordConfirm.trim(),
        role:role.trim(),
        adminLevel:adminLevel.trim()
    });
    res.status(201).json({
        status: 'success',
        data: {
        admin,
        },
    });
});

exports.updateAdmin = catchAsync(async (req, res, next)=>{
  const {
    nomAdmin,
    prenomAdmin,
    role,
    username,
    email,
    adminLevel

  } = req.body;
  const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
        throw new  AppError('No admin found with that ID', 404);
    }
    if(nomAdmin) admin.nomAdmin = nomAdmin;
    if(prenomAdmin) admin.prenomAdmin = prenomAdmin;
    if(role) admin.role = role;
    if(username) admin.username = username;
    if(email) admin.email = email;
    if(adminLevel) admin.adminLevel = adminLevel;

    await admin.save();

    res.status(201).json({
        status: 'success',
        data: {
        admin,
        },
    });
}); 

exports.deleteAdmin = catchAsync(async (req, res, next) => {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
        throw new  AppError('No admin found with that ID', 404);
    }
    await admin.destroy();
    res.status(200).json({
        status: 'success',
        data: admin,
    });
});


exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get Admin from database

  const admin = await Admin.findOne({
    where: {
      id: req.user.id,
    },
    attributes: ['id', 'password'],
  });

  // 2) Check if POSTed current password is correct
  if (
    !(await admin.correctPassword(
      req.body.passwordCurrent.trim(),
      admin.password
    ))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password

  admin.password = req.body.password;
  admin.passwordConfirm = req.body.passwordConfirm;

  await admin.save();
  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});

exports.getAdminStatistcs = catchAsync(async (req, res, next) => {

  const nbTotalStudents = await Student.findAll({
    attributes: [[Sequelize.fn('COUNT', 'id'), 'total students']],
    plain: true,
  });

  const nbTotalFootball = await Student.findAll({
    attributes: [[Sequelize.fn('COUNT', 'id'), 'total football students']],
    where:{
      sport: 'football'
    },
    plain: true,
  });

  const nbTotalBasketball = await Student.findAll({
    attributes: [[Sequelize.fn('COUNT', 'id'), 'total basketball students']],
    where:{
      sport: 'basketball'
    },
    plain: true,
  });

  const nbTotalParCommune = await Student.findAll({
    attributes: ['commune',[Sequelize.fn('COUNT', 'commune'), 'total students par commune']],
    group: ['commune'],
    raw: true,
  });
  
   

   const expectationPresence = await Presence.sequelize.query(
    " SELECT count(*) as allseance"
   +" FROM presences"
  +" where EXTRACT('week' FROM \"datePresence\") = EXTRACT('week' FROM now());", { type: QueryTypes.SELECT });

   const nbPresenceSemaine = await Presence.sequelize.query(
    " SELECT count(*) as presence"
   +" FROM presences"
  +" where EXTRACT('week' FROM \"datePresence\") = EXTRACT('week' FROM now()) and presence = 'present';", { type: QueryTypes.SELECT });

   const nbAbsenceSemaine = await Presence.sequelize.query(
    " SELECT count(*) as absence"
   +" FROM presences"
  +" where EXTRACT('week' FROM \"datePresence\") = EXTRACT('week' FROM now()) and presence = 'absent';", { type: QueryTypes.SELECT });

  const tauxPresence = nbPresenceSemaine[0].presence / expectationPresence[0].allseance;
  const tauxAbsence = nbAbsenceSemaine[0].absence / expectationPresence[0].allseance;

  res.status(200).json({
    status: 'success',
    data: {
      nbTotalStudents,
      nbTotalFootball,
      nbTotalBasketball,
      nbTotalParCommune,
      tauxPresence:tauxPresence,
      tauxAbsence:tauxAbsence
    },
  });

});
