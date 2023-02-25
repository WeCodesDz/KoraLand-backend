const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Message = require('./messageModel');


exports.getAllMessagesByRoom = catchAsync(async (req, res, next) => {
    let { page, limit } = req.query;
    let { roomId } = req.params;
    page = page * 1 || 1;
    limit = limit * 1 || 100;
    const offset = (page - 1) * limit;
    const where = {
        roomId: roomId
    }
    const results = await Message.findAndCountAll({
        where,
        limit,
        offset,
        order : [['createAt', 'ASC']]
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


// request t affiher les parent avec message lekher ta3hom ki y cliquer 3la wahda fihom ydir join l chatroom 
// parents.findAll({
//     {
//         where : {
//             status : actif
//     },
//     include:[
//         message:
//         onder desc 
//         limit 1
//     ]
// })