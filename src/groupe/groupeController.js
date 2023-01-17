const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Groupe = require('./groupeModel');
const Student = require('../student/studentModel');
const Coach = require('../coach/coachModel');

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
        categorieAge
    } = req.body;
    
    if(!groupeName || !horaireEntrainement || !sport || !categorieAge) {
        return new AppError('Please provide all fields', 400);
    }
    
    const groupe = await Groupe.create({
        groupeName,
        horaireEntrainement,
        sport,
        categorieAge
    });

    //coachAffected here if exist

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
    const results = await Groupe.findAndCountAll({ 
        attributes: ['id', 'groupeName', 'horaireEntrainement', 'sport', 'categorieAge'],
        where,
        limit,
        offset
     });
    res.status(200).json({
        status: 'success',
        rows: results.length,
    data: {
      totalPages: Math.ceil(results.count / limit),
      page,
      limit,
      rows: results.rows.length,
      totalGroupes: results.rows,
    },
    });
});

exports.getGroupeById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const groupe = await Groupe.findByPk(id);
    if (!groupe) {
        return new AppError('No groupe found with that ID', 404);
    }
    res.status(200).json({
        status: 'success',
        data:{
            groupe,
        }
    });
});

exports.updateGroupe = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // const { groupeName, horaireEntrainement, sport, categorieAge } = req.body;
    const groupe = await Groupe.findByPk(id);
    if (!groupe) {
      return new AppError('No groupe found with that ID', 404);
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
      return new AppError('No groupe found with that ID', 404);
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
    return new AppError('No groupe found with that ID', 404);
  }

  const student = await Student.findByPk(req.body.studentId.trim());
  if(!student){
    return new AppError('No student found with that ID', 404);
  }

  await groupe.addStudent(student);
  res.status(200).json({
    status: 'success',
  });

});

exports.getGroupeStudents = catchAsync( async(req, res, next)=>{
  const groupe = await Groupe.findByPk(req.body.groupeId.trim());
  if(!groupe){
    return new AppError('No groupe found with that Id', 404);
  }

  const students = await groupe.getStudents();
  if(!students){
    return new AppError('No students found in this groupe', 404);
  }
  res.status(200).json({
    status: 'success',
    body:{
      ...groupe.dataValues,
      students
    }
  });
});


exports.deleteStudentGroupe = catchAsync( async(req, res, next)=>{
  const groupe = await Groupe.findByPk(req.body.groupeId.trim());
  if(!groupe){
    return new AppError('No groupe found with that Id', 404);
  }

  const student = await Student.findByPk(req.body.studentId.trim());
  if(!student){
    return new AppError('No student found with that Id', 404);
  }

  await groupe.removeStudent(student);
  res.status(200).json({
    status: 'success',
  });
});