const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshAdmin = require('./refreshAdminModel');
const Admin = require('../administrateur/administrateurModel');

exports.handleAdminRefreshToken = catchAsync(async (req, res, next) => {
    const {cookies} = req;
    if(!cookies.jwt){
        throw new AppError('unauthorized',401);
    }
    const refreshToken = cookies.jwt;
    const clearCookieOptions = { httpOnly: true, sameSite: 'None' }
    
    if (process.env.NODE_ENV === 'production') clearCookieConfig.secure = true;
   

    res.clearCookie('jwt',clearCookieOptions);
    const where= refreshToken?{
        jwt: refreshToken
    }:{}

    const adminRefreshToken = await RefreshAdmin.findOne({
       where:where,
        
    });
    

    const adminRefreshTokenRaw = adminRefreshToken?{...adminRefreshToken.dataValues}:undefined;
    
    let admin;
    if(adminRefreshTokenRaw){
        admin = await Admin.findOne({
            where: {
                id: adminRefreshTokenRaw.administrateurId
            }
        });
    }
    if(!adminRefreshTokenRaw){
        const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
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
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { "username": admin.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
  const createdRefreshToken = await RefreshAdmin.create({jwt:newRefreshToken});
  
  await admin.addRefreshes(createdRefreshToken)
  const cookieOptions = { httpOnly: true, sameSite: 'None' };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt',newRefreshToken,cookieOptions);

  res.json({ role:'admin',adminLevel:admin.adminLevel, accessToken });


});