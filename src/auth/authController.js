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
        
      if (!roles.includes(req.role)) {
        return next(
          new AppError("You don't have permission to perform this action", 403)
        );
      }
      next();
    };
  };
 
exports.loginAdmin = catchAsync(async (req, res, next) => {

  const {cookies} = req;

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
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN}
    );

    const newRefreshToken = jwt.sign(
      { "username": user.username ,"role": "admin"},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
   
  if(cookies?.jwt){
    const refreshToken = {...cookies};
    const foundToken = await user.getRefreshes({where:{jwt:refreshToken.jwt}});
    
    if (!foundToken) {
      await RefreshAdmin.destroy({where:{administrateurId:user.id}});
    }
    const clearCookieConfig = { httpOnly: true, sameSite: 'None' }
    
    if (process.env.NODE_ENV === 'production') clearCookieConfig.secure = true;
    res.clearCookie('jwt',clearCookieConfig );
    
  }
  const createdRefreshToken = await RefreshAdmin.create({jwt:newRefreshToken});
  await user.addRefreshes(createdRefreshToken);

  const cookieOptions = { httpOnly: true,  sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.cookie('jwt', newRefreshToken, cookieOptions);
  res.json({ role:'admin',adminLevel:user.adminLevel, accessToken });

});  

exports.loginCoach = catchAsync(async (req, res, next) => {
  const {cookies} = req;

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
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { "username": user.username ,"role": "coach"},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
   
  if(cookies?.jwt){
    const refreshToken = {...cookies};
    const foundToken = await user.getRefreshes({where:{jwt:refreshToken.jwt}});
    
    if (!foundToken) {
      await RefreshCoach.destroy({where:{coachId:user.id}});
    }
    const clearCookieConfig = { httpOnly: true, sameSite: 'None' }
    
    if (process.env.NODE_ENV === 'production') clearCookieConfig.secure = true;
    res.clearCookie('jwt',clearCookieConfig );
    
  }
  const createdRefreshToken = await RefreshCoach.create({jwt:newRefreshToken});
  await user.addRefreshes(createdRefreshToken);

  const cookieOptions = { httpOnly: true,  sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', newRefreshToken, cookieOptions);

  res.json({ role:'coach', accessToken });
});  

exports.loginParent = catchAsync(async (req, res, next) => {
  const {cookies} = req;

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
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN}
    );

    const newRefreshToken = jwt.sign(
      { "username": user.username ,"role": "parent"},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
   
  if(cookies?.jwt){
    const refreshToken = {...cookies};
    const foundToken = await user.getRefreshes({where:{jwt:refreshToken.jwt}});
    
    if (!foundToken) {
      await RefreshParent.destroy({where:{parentId:user.id}});
    }
    const clearCookieConfig = { httpOnly: true, sameSite: 'None' }
    
    if (process.env.NODE_ENV === 'production') clearCookieConfig.secure = true;
    res.clearCookie('jwt',clearCookieConfig );
    
  }
  const createdRefreshToken = await RefreshParent.create({jwt:newRefreshToken});
  await user.addRefreshes(createdRefreshToken);

  const cookieOptions = { httpOnly: true,  sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', newRefreshToken, cookieOptions);

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
  const {role} = decoded.UserInfo;
  if(role.includes('admin') ){
    currentUser = await Admin.findOne({
      where: { username: decoded.UserInfo.username },
   });
 }
 if(role.includes('coach') ){
   currentUser = await Coach.findOne({
      where: { username: decoded.UserInfo.username },
   });
 }
 if(role.includes('parent')){
   currentUser = await Parent.findOne({
      where: { username: decoded.UserInfo.username },
   });
  }
   
   if (!currentUser) {
     return next(
       new AppError('User belonging to this token does no longer exist.', 401)
     );
   }
   req.user = currentUser;
   req.role = role;
   next();
  
});

exports.logout =  catchAsync(async (req, res, next) => {
  
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  
  let currentRefreshToken;
  
  if(decoded.role?.includes('admin') ){
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

  const clearCookieConfig = { httpOnly: true, sameSite: 'None' }
    
  if (process.env.NODE_ENV === 'production') clearCookieConfig.secure = true;
  res.clearCookie('jwt',clearCookieConfig );
  
  res.sendStatus(204);
});

exports.getMyProfilsInfo = catchAsync(async (req, res, next) => {
  const user = {...req.user.dataValues};
  user.password = undefined;
  user.passwordConfirm = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.createdAt = undefined;
  user.updatedAt = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});