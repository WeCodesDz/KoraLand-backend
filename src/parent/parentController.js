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
    let { page ,limit } = req.body;
    let results;
    page = page * 1 || 1;
    limit = limit * 1 || 1;
    // offset is the number of rows skipped
    const offset = (page - 1) * limit;
    //filtering
    const where = filter(req.query);
   if(req.user.adminLevel === 'superadmin'){
         results = await Parent.findAndCountAll({
        attributes: ['id', 'nomParent', 'prenomParent', 'username',  'numeroTelephone', 'status'],
        where,
        limit,
        offset
    });
   }
   if(req.user.adminLevel === 'level2' || req.user.adminLevel === 'level3'){
     results = await Parent.findAndCountAll({
        attributes: ['id', 'nomParent', 'prenomParent', 'username', 'status'],
        where,
        limit,
        offset
    });
}

    res.status(200).json({
        status: 'success',
        rows: results.count,
        data: {
            totalPages: Math.ceil(results.count / limit),
            page,
            limit,
            rows: results.rows.length,
            totalParents: results.rows,
        },
    });
});

exports.getParentbyId = catchAsync(async (req, res, next) => {
    let parent;
    if(req.user.adminLevel === 'superAdmin'){
        parent = await Parent.findByPk(req.params.id,{
            attributes: ['id', 'nomParent', 'prenomParent', 'email','numeroTelephone']
        });
    }
    if(req.user.adminLevel === 'level2' || req.user.adminLevel === 'level3'){
        parent = await Parent.findByPk(req.params.id,{
            attributes: ['id', 'nomParent', 'prenomParent', 'email']
        });
    } 
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