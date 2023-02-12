const Sequelize = require('sequelize');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Admin = require('../administrateur/administrateurModel');
const Coach = require('../coach/coachModel');
const Parent = require('../parent/parentModel');
const RefreshAdmin = require('../refreshAdmin/refreshAdminModel');
const RefreshCoach = require('../refreshCoach/refreshCoachModel');
const RefreshParent = require('../refreshParent/refreshParentModel');


exports.role = (...roles) => {
    return (req, res, next) => {
        
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError("You don't have permission to perform this action", 403)
        );
      }
      next();
    };
  };
 
exports.loginAdmin = catchAsync(async (req, res, next) => {

  const cookies = req.cookies;

    const {  password,username } = req.body;
    
    if(!password || !username) {
        throw new  AppError('Please provide username and password  ', 400);
    }
    
    const user = await Admin.findOne({ where: { username: username.trim() } });
    const isCorrectPassword = await user?.correctPassword(password.trim(), user.password);

    
    if (!user ||
       !isCorrectPassword) {
        return next(new AppError('Incorrect username or password', 401));
      }
     
      // create JWTs
      const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": user.username,
                "role": "admin"
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );


  if(cookies?.jwt){
    const refreshToken = cookies.jwt;
    const foundToken = await user.getRefreshAdmins({where:{jwt:refreshToken}});
    if (!foundToken) {
     await RefreshAdmin.destroy({where:{administrateurId:user.id}});
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  }
  const createdRefreshToken = await RefreshAdmin.create({jwt:newRefreshToken});
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'admin', accessToken });

});  

exports.loginCoach = catchAsync(async (req, res, next) => {
   const cookies = req.cookies;

    const {  password,username } = req.body;
    
    if(!password || !username) {
        throw new  AppError('Please provide username and password  ', 400);
    }
    
    const user = await Coach.findOne({ where: { username: username.trim() } });
    const isCorrectPassword = await user?.correctPassword(password.trim(), user.password);

    
    if (!user ||
       !isCorrectPassword) {
        return next(new AppError('Incorrect username or password', 401));
      }
     
      // create JWTs
      const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": user.username,
                "role": "coach"
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );


  if(cookies?.jwt){
    const refreshToken = cookies.jwt;
    const foundToken = await user.getRefreshCoachs({where:{jwt:refreshToken}});
    if (!foundToken) {
     await RefreshCoach.destroy({where:{coachId:user.id}});
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  }
  const createdRefreshToken = await RefreshCoach.create({jwt:newRefreshToken});
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'coach', accessToken });
});  

exports.loginParent = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;

    const {  password,username } = req.body;
    
    if(!password || !username) {
        throw new  AppError('Please provide username and password  ', 400);
    }
    
    const user = await Parent.findOne({ where: { username: username.trim() } });
    const isCorrectPassword = await user?.correctPassword(password.trim(), user.password);

    
    if (!user ||
       !isCorrectPassword) {
        return next(new AppError('Incorrect username or password', 401));
      }
     
      // create JWTs
      const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": user.username,
                "role": "parent"
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );


  if(cookies?.jwt){
    const refreshToken = cookies.jwt;
    const foundToken = await user.getRefreshParents({where:{jwt:refreshToken}});
    if (!foundToken) {
     await RefreshParent.destroy({where:{parentId:user.id}});
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  }
  const createdRefreshToken = await RefreshParent.create({jwt:newRefreshToken});
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'parent', accessToken });
});  

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);
  let currentUser;
  if(decoded.role.includes('admin') ){
    currentUser = await Admin.findOne(decoded.username);
 }
 if(decoded.role.includes('coach') ){
   currentUser = await Coach.findOne(decoded.username);
 }
 if(decoded.role.includes('parent')){
   currentUser = await Parent.findOne(decoded.username);
  }
   
   if (!currentUser) {
     return next(
       new AppError('User belonging to this token does no longer exist.', 401)
     );
   }
   req.user = currentUser;
   req.role = decoded.role;
   next();
  
});

exports.logout =  catchAsync(async (req, res, next) => {
  
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const decoded = await promisify(jwt.verify)(refreshToken, process.env.ACCESS_TOKEN_SECRET);
  let currentRefreshToken;
  if(decoded.role.includes('admin') ){
    currentRefreshToken = await RefreshAdmin.findOne({where:{jwt:refreshToken}});
 }
 if(decoded.role.includes('coach') ){
  currentRefreshToken = await RefreshCoach.findOne({where:{jwt:refreshToken}});
 }
 if(decoded.role.includes('parent')){
  currentRefreshToken = await RefreshParent.findOne({where:{jwt:refreshToken}});
  }
  
  if (currentRefreshToken) {
    await currentRefreshToken.destroy();
  }


  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.sendStatus(204);
});

