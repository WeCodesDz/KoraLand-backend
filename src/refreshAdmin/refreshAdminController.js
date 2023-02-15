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

    const adminRefreshToken = await RefreshAdmin.findOne({
        where: {
            jwt: refreshToken
        },
        raw:true
    });
    let admin;
    if(adminRefreshToken){
        admin = await Admin.findOne({
            where: {
                id: adminRefreshToken.administrateurId
            }
        });
    }
    if(!adminRefreshToken){
        const decoded = await promisify(jwt.verify)(adminRefreshToken, process.env.REFRESH_TOKEN_SECRET);
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
    const deletedAdminRefreshToken = adminRefreshToken;
    await adminRefreshToken.destroy();

    const decoded = await promisify(jwt.verify)(deletedAdminRefreshToken, process.env.REFRESH_TOKEN_SECRET);
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
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": admin.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );
  const createdRefreshToken = await RefreshAdmin.create({jwt:newRefreshToken});
  await createdRefreshToken.setAdmin(admin);
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'admin', accessToken });


});