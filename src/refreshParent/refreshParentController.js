const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshParent = require('./refreshParentModel');
const Parent = require('../parent/parentModel');

exports.handleParentRefreshToken = catchAsync(async (req, res, next) => {
    const cookies = req.cookies;
    if(!cookies){
        res.sendStatus(401);
    }
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const parentRefreshToken = await RefreshParent.findOne({
        where: {
            jwt: refreshToken
        },
    });
    let parent;
    if(parentRefreshToken){
        parent = await Parent.findOne({
            where: {
                id: parentRefreshToken.parentId
            },
        }); 
    }
    if(!parentRefreshToken){
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
    
    const deletedParentRefreshToken =parentRefreshToken;
    await parentRefreshToken.destroy();

    const decoded = await promisify(jwt.verify)(deletedParentRefreshToken.jwt, process.env.REFRESH_TOKEN_SECRET);
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
        process.env.JWT_SECRET,
        { expiresIn: '10s' }
    );

    const newRefreshToken = jwt.sign(
      { "username": parent.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );
  const createdRefreshToken = await RefreshParent.create({jwt:newRefreshToken});
  await parent.addRefreshes(createdRefreshToken); 
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'parent', accessToken });


});