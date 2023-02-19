const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshCoach = require('./refreshCoachModel');
const { request } = require('http');
const Coach = require('../coach/coachModel');

exports.handleCoachRefreshToken = catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    if(!cookies){
        res.sendStatus(401);
    }

    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const coachRefreshToken = await RefreshCoach.findOne({
        where: {
            jwt: refreshToken
        }
    });
    let coach;
    if(coachRefreshToken){
        coach = await Coach.findOne({
            where: {
                id: coachRefreshToken.coachId
            }
        });
    }

    if(!coachRefreshToken){
        const decoded = await promisify(jwt.verify)(coachRefreshToken.get({plain:true}).jwt, process.env.REFRESH_TOKEN_SECRET);
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
    const deletedCoachRefreshToken = coachRefreshToken;
    await coachRefreshToken.destroy();

    const decoded = await promisify(jwt.verify)(deletedCoachRefreshToken.get({plain:true}).jwt, process.env.REFRESH_TOKEN_SECRET);
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
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": coach.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );
  const createdRefreshToken = await RefreshCoach.create({jwt:newRefreshToken, coachId:coach.id});
//   await coach.addRefreshes(createdRefreshToken); 
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'coach', accessToken , username: coach.username });


});