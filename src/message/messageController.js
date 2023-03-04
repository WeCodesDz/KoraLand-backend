const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Message = require('./messageModel');
const Parent = require('../parent/parentModel');
const { model } = require('../../database');

exports.getAllMessagesByRoom = catchAsync(async (req, res, next) => {
    let { page, limit,roomId  } = req.query;
    // let { roomId } = req.params;
    page = page * 1 || 1;
    limit = limit * 1 || 100;
    const offset = (page - 1) * limit;
    const where = {
        roomsId: roomId
    }
    console.log("**************************************")
    console.log(page,'-------',limit)
    console.log(where)
    console.log("**************************************")
    const results = await Message.findAndCountAll({
        where,
        limit,
        offset,
        order : [['createdAt', 'ASC']]
    });
    res.status(200).json({
        status: 'success',
        rows: results.length,
    data: {
      totalPages: Math.ceil(results.count / limit),
      page,
      limit,
      rows: results.rows.length,
      totalMessages: results.rows,
    },
    });
});


 exports.getAllDisscussions = catchAsync(async (req, res, next) => {
    const parents = await Parent.findAll({ 
        where:{
            status: 'actif'
        },
        include:{
            model: Message,
            as: 'messages',
            attributes: ['id', 'body', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 1
    }
    });

    res.status(200).json({
        status: 'success',
        data: {
            parents
        }
    });
 });