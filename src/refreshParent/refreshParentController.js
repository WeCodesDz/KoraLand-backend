const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshParent = require('./refreshParentModel');
const Parent = require('../parent/parentModel');

exports.handleParentRefreshToken = catchAsync(async (req, res, next) => {
    const {cookies} = req;
    if(!cookies.jwt){
        throw new AppError('unauthorized',401);
    }
    const refreshToken = cookies.jwt;
    const clearCookieOptions = { httpOnly: true, sameSite: 'None' };
    if (process.env.NODE_ENV === 'production') clearCookieOptions.secure = true;

    res.clearCookie('jwt',clearCookieOptions);

    const where= refreshToken?{
        jwt: refreshToken
    }:{}

    const parentRefreshToken = await RefreshParent.findOne({
        where:where
    });

    const parentRefreshTokenRaw = parentRefreshToken?{...parentRefreshToken.dataValues}:undefined;


    let parent;
    if(parentRefreshTokenRaw){
        parent = await Parent.findOne({
            where: {
                id: parentRefreshTokenRaw.parentId
            },
        }); 
    }
    if(!parentRefreshTokenRaw){
        const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(decoded){
            //  parent = await parentRefreshToken.getParent();
            parent = await Parent.findOne({
                where: {
                    username: decoded.username
                }, 
            }); 
           await RefreshParent.destroy({
                where:{
                    parentId: parent.id
                }
            });
           
        }
        throw new AppError('Fordbidden', 403);
    }
    
    //const deletedParentRefreshToken =parentRefreshToken;
    await parentRefreshToken.destroy();

    const decoded = await promisify(jwt.verify)(parentRefreshTokenRaw.jwt, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded || decoded.username !== parent?.username) {
        throw new AppError('Fordbidden', 403);
    }
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": parent.username,
                "role": "parent"
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
        { "username": parent.username ,"role": "parent"},
        process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
  const createdRefreshToken = await RefreshParent.create({jwt:newRefreshToken});
  await parent.addRefreshes(createdRefreshToken); 
  const cookieOptions = { httpOnly: true, sameSite: 'None' };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt',newRefreshToken,cookieOptions);
  res.json({ role:'parent', username:parent.username ,accessToken });


});