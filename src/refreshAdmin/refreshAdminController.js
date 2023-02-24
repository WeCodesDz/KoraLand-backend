const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshAdmin = require('./refreshAdminModel');
const Admin = require('../administrateur/administrateurModel');

exports.handleAdminRefreshToken = catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    if(!cookies){
        res.sendStatus(401);
    }
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    const where= refreshToken?{
        jwt: refreshToken
    }:{}

    const adminRefreshToken = await RefreshAdmin.findOne({
       where:where,
        
    });
    

    const adminRefreshTokenRaw = adminRefreshToken?adminRefreshToken.dataValues:undefined;
    
    let admin;
    if(adminRefreshTokenRaw){
        admin = await Admin.findOne({
            where: {
                id: adminRefreshTokenRaw.administrateurId
            }
        });
    }
    if(!adminRefreshTokenRaw){
        const decoded = await promisify(jwt.verify)(adminRefreshTokenRaw, process.env.REFRESH_TOKEN_SECRET);
        if(decoded){
             admin = await Admin.findOne({
                    where:{
                        username: decoded.username
                    }
                });
            await RefreshAdmin.destroy({
                where:{
                    adminId: admin.id
                }
            });
        }
        throw new AppError('Fordbidden', 403);
    }
    //const deletedAdminRefreshToken = adminRefreshToken;
    await adminRefreshToken.destroy();

    const decoded = await promisify(jwt.verify)(adminRefreshTokenRaw.jwt, process.env.REFRESH_TOKEN_SECRET);
    console.log(decoded);
    if (!decoded || decoded.username !== admin?.username) {
        throw new AppError('Fordbidden', 403); 
    }
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": admin.username,
                "role": "admin"
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": admin.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );
  const createdRefreshToken = await RefreshAdmin.create({jwt:newRefreshToken});
  
  await admin.addRefreshes(createdRefreshToken)
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'admin', accessToken });


});