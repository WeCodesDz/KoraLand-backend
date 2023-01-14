const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Parent = require('./parentModel');


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
      if (['status'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });
    return where;
  };

exports.createParent = catchAsync(async (req, res, next) => {
    const {
        nomParent,
        prenomParent,
        email,
        numeroTelephone,
        username,
        password,
        passwordConfirm
    } = req.body;
    
    if(!nomParent || !prenomParent || !email || !username || !password || !passwordConfirm || !numeroTelephone) {
        return new AppError('Please provide all fields', 400);
    }
    
    const parent = await Parent.create({
        nomParent,
        prenomParent,
        email,
        numeroTelephone,
        username,
        password,
        passwordConfirm,
        role: 'parent'
    });
    res.status(201).json({
        status: 'success',
        data: {
            parent,
        },
    });
});


exports.getAllParents = catchAsync(async (req, res, next) => {
   //superadmin can watch phone numbers
   let results;
   if(req.user.adminLevel === 'superadmin'){
         results = await Parent.findAndCountAll({
        attributes: ['id', 'nomParent', 'prenomParent', 'username',  'numeroTelephone', 'status']
    });
   }
   if(req.user.adminLevel === 'level2' || req.user.adminLevel === 'level3'){
     results = await Parent.findAndCountAll({
        attributes: ['id', 'nomParent', 'prenomParent', 'username', 'status']
    });
}

    res.status(200).json({
        status: 'success',
        rows: results.count,
        data: {
            totalParents: results.rows,
            totalPages: Math.ceil(results.count / limit),
            page,
            limit,
            rows: results.rows.length,
            Parents: results.rows
        },
    });
});

exports.getParentbyId = catchAsync(async (req, res, next) => {
    //superadmin can watch phone numbers 
    const parent = await Parent.findByPk(req.params.id,{
        attributes: ['id', 'nomParent', 'prenomParent', 'email','numeroTelephone']
    });
    res.status(200).json({
        status: 'success',
        data: {
            parent,
        },
    });
});

exports.updateParent = catchAsync(async (req, res, next) => {
   const parent = await Parent.findByPk(req.params.id);
    if(!parent) {
        return new AppError('Parent not found', 404);
    }
    await parent.update(req.body);
    res.status(200).json({
        status: 'success',
        data:{
            parent,
        }
    });
        });

exports.deleteParent = catchAsync(async (req, res, next) => {
    const parent = await Parent.findByPk(req.params.id);
    if(!parent) {
        return new AppError('Parent not found', 404);
    }
    await parent.destroy();
    res.status(200).json({
        status: 'success',
        data: parent,
    });
});