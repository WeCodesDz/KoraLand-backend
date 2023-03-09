const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Message = require('./messageModel');
const Parent = require('../parent/parentModel');
const notificationParentController = require("./src/notificationParent/notificationParentController");
const notificationAdminController = require("./src/notificationAdmin/notificationAdminController");
const notificationCoachController = require("./src/notificationCoach/notificationCoachController");

exports.getAllMessagesByRoom = catchAsync(async (req, res, next) => {
    let { page, limit,roomId  } = req.query;
    // let { roomId } = req.params;
    page = page * 1 || 1;
    limit = limit * 1 || 100;
    const offset = (page - 1) * limit;
    const where = {
        roomsId: roomId
    }

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

 exports.createMessage = catchAsync(async (req, res, next) => {
    const { roomsId,parentId,adminId, body }= req.body;
    if(!roomsId){
        throw new AppError('no room !',400);
    }
    if(!parentId && !adminId){
        throw new AppError('no parent or admin !',400);
    }
    if(!body){
        throw new AppError('no body !',400);
    }
    parentRoom = await Parent.findByPk(roomsId);

    if(!parentRoom){
        throw new Error('parent doesn\'t exist !');
    }
    if (parentId && parentId !== roomsId) {
        throw new Error('parent id and room id are not the same !');
    }
    let admin;
    if(adminId){
        admin = await Administrateur.findByPk(adminId);
                if(!admin){
                    throw new Error('admin doesn\'t exist !');
                }
    }
    const message = await Message.create({body});
    if(parentId){
        await parentRoom.addRooms(message);
        await parentRoom.addMessages(message);
    }
    if(adminId){
        await parent.addRooms(message);
        await admin.addMessage(message);
    }
    if(parentId && !adminId) {

        const admins = await Administrateur.findAll({
          attributes:['username','id'],
          raw:true
        })
        if(admins.length > 0) {
          const ids= admins.map((admin)=>admin.id);
          const usernames = admins.map((admin)=>admin.username);
         const notification= await notificationAdminController.createNotificationAdmin(ids,{
            title:'Nouveau message',
            desc:`${parent.prenomParent} ${parent.nomParent} vous a envoyé un nouveau message`,
            type:'message'
          });
          usernames.forEach((admin)=>{
            io.to(admin).emit("newNotification", notification.dataValues);
          });
          await notificationAdminController.sendPushNotificationToAdmin(ids,notification.dataValues);
        }
      }

 })