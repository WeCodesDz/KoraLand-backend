const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RefreshParent = require('./refreshParentModel');

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
        }
    });
    let parent;
    if(parentRefreshToken){
        const decoded = await promisify(jwt.verify)(parentRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(decoded){
             parent = await parentRefreshToken.getParent();    
            await RefreshParent.destroy({
                where:{
                    parentId: parent.id
                }
            });
        }
        res.sendStatus(403);
    }
    const deletedParentRefreshToken = await parentRefreshToken.destroy();
    const decoded = await promisify(jwt.verify)(deletedParentRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded || decoded.username !== parent?.username) {
        return res.sendStatus(403); 
    }
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": parent.username,
                "role": "parent"
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { "username": parent.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
  );
  const createdRefreshToken = await RefreshParent.create({jwt:newRefreshToken});
  res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7*24 * 60 * 60 * 1000 });

  res.json({ role:'parent', accessToken });


});