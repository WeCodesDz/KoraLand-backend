const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Coach = require('./coachModel');

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
      if (['categories'].includes(obj[0])) {
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
        numeroTelephone,
        username,
        password,
        passwordConfirm,
        categories,
    } = req.body;
    
    if(!nomCoach || !prenomCoach || !email || !username || !password || !passwordConfirm || !numeroTelephone || !categories) {
        return new AppError('Please provide all fields', 400);
    }
    
    const coach = await Coach.create({
        nomCoach,
        prenomCoach,
        email,
        numeroTelephone,
        username,
        password,
        passwordConfirm,
        categories,
        role:'coach'
    });
    res.status(201).json({
        status: 'success',
        data: {
        coach,
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
  //here we should test the admin role before setting the attributs (only super admin can see the phone number)
  if(req.admin.role === 'superAdmin'){
     results = await Coach.findAndCountAll({
        attributes:['id','nomCoach','prenomCoach','email','numeroTelephone','username','categories'],
        where,
        limit,
        offset,
      });
  }
  if(req.admin.role === 'level2' || req.admin.role === 'level3'){
     results = await Coach.findAndCountAll({
        attributes:['id','nomCoach','prenomCoach','email','username','categories'],
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
    const coach = await Coach.findByPk(req.params.id);
    if (!coach) {
        return new AppError('No coach found with that ID', 404);
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
        return new AppError('No coach found with that ID', 404);
    }
    // we should update the coachs groupe and students here after updating the coach
    coach.update(req.body);
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
        return new AppError('No coach found with that ID', 404);
    }
    coach.destroy();
    res.status(200).json({
        status: 'success',
        data: coach,
    });
});