const Sequelize = require('sequelize');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Admin = require('../administrateur/administrateurModel');
const Coach = require('../coach/coachModel');
const Parent = require('../parent/parentModel');


const { Op } = Sequelize;

const signToken = (id,accesToken) =>
  jwt.sign({ id,accesToken }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, accesToken, statusCode, res) => {
  const token = signToken(user.id,accesToken);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  //user.passwordConfirm = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

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

exports.login = catchAsync(async (req, res, next) => {
    const { email, password,accesToken } = req.body;
    let authenticate;
    if(!email ) {
        return new AppError('Please provide email ', 400);
    }
    if(!password ) {
        return new AppError('Please provide password ', 400);
    }
    if(accesToken === 'admin') 
    authenticate = await Admin.findOne({ where: { email: email.trim() } });
    if(accesToken === 'coach')
    authenticate = await Coach.findOne({ where: { email: email.trim() } });
    if(accesToken === 'parent')
    authenticate = await Parent.findOne({ where: { email: email.trim() } });
    
    if (!authenticate || !(await authenticate.correctPassword(password.trim(), authenticate.password))) {
        return next(new AppError('Incorrect Email or password', 401));
      }
     // 3) If everything ok, send token to client
  createSendToken(authenticate,accesToken, 200, res);  
});  

exports.protect = catchAsync(async (req, res, next) => {
    // 1) getting the token and check iff its there
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
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if(decoded.accesToken === 'admin'){
    currentUser = await Admin.findByPk(decoded.id);
    if (!currentUser) {
     return next(
       new AppError('Admin belonging to this token does no longer exist.', 401)
     );
   }
    res.locals.admin = currentUser;
    req.admin = currentUser;
 }
 if(decoded.accesToken === 'coach'){
   currentUser = await Coach.findByPk(decoded.id);
   if (!currentUser) {
     return next(
       new AppError('Coach belonging to this token does no longer exist.', 401)
     );
   }
   res.locals.coach = currentUser;
   req.coach = currentUser;
 }
 if(decoded.accesToken === 'parent'){
   currentUser = await Parent.findByPk(decoded.id);
   if (!currentUser) {
     return next(
       new AppError('Parent belonging to this token does no longer exist.', 401)
     );
   }
   res.locals.parent = currentUser;
   res.parent = currentUser;
}
next(); 
});

