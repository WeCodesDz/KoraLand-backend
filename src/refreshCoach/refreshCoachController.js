const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshCoach = require('./refreshCoachModel');
const { request } = require('http');
const Coach = require('../coach/coachModel');

exports.handleCoachRefreshToken = catchAsync(async (req, res, next) => {
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

    const coachRefreshToken = await RefreshCoach.findOne({
        where:where
    });

    const coachRefreshTokenRaw = coachRefreshToken?{...coachRefreshToken.dataValues}:undefined;


    let coach;
    if(coachRefreshTokenRaw){
        coach = await Coach.findOne({
            where: {
                id: coachRefreshTokenRaw.coachId
            }
        });
    }

    if(!coachRefreshTokenRaw){
        const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(decoded){
             coach = await Coach.findOne({
                where: {
                    username: decoded.username
                }
             });

            await RefreshCoach.destroy({
                where:{
                    coachId: coach.id
                }
            });
        }
        throw new AppError('Fordbidden', 403);
    }
    //const deletedCoachRefreshToken = coachRefreshToken;
    await coachRefreshToken.destroy();

    const decoded = await promisify(jwt.verify)(coachRefreshTokenRaw.jwt, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded || decoded.username !== coach?.username) {
        throw new AppError('Fordbidden', 403); 
    }
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": coach.username,
                "role": "coach"
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
        { "username": user.username ,"role": "coach"},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN}
  );
  const createdRefreshToken = await RefreshCoach.create({jwt:newRefreshToken});
   await coach.addRefreshes(createdRefreshToken); 
   const cookieOptions = { httpOnly: true, sameSite: 'None' };
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
 
   res.cookie('jwt',newRefreshToken,cookieOptions);
  res.json({ role:'coach', accessToken , username: coach.username });


});