const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Parent = require('./parentModel');



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
    const parents = await Parent.findAll({
        attributes: ['id', 'nomParent', 'prenomParent', 'email', 'username',  'numeroTelephone']
    });
    res.status(200).json({
        status: 'success',
        data: {
            parents,
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