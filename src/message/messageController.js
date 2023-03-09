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
    const { subject,parentId,adminId, body }= req.body;
    if(!subject){
        throw new AppError('no subject found !',400);
    }
    if(!parentId && !adminId){
        throw new AppError('no parent or admin !',400);
    }
    if(!body){
        throw new AppError('no body !',400);
    }
    const subjectId = subject+''+Date.now();
    // parentRoom = await Parent.findByPk(roomsId);

    // if(!parentRoom){
    //     throw new Error('parent doesn\'t exist !');
    // }
    // if (parentId && parentId !== roomsId) {
    //     throw new Error('parent id and room id are not the same !');
    // }
    let parent;
    if(parentId){
        parent = await Parent.findByPk(parentId);
        if(!parent){
            throw new AppError('parent doesn\'t exist !',404);
        }
    }
    let admin;
    if(adminId){
        admin = await Administrateur.findByPk(adminId);
                if(!admin){
                    throw new AppError('admin doesn\'t exist !',404);
                }
    }
    const message = await Message.create({
        subjectId,
        subject,
        body,
    });
    if(parentId){

        // await parentRoom.addRooms(message);
        await parent.addMessages(message);
    }
    if(adminId){
        // await parent.addRooms(message);
        await admin.addMessages(message);
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

    if(adminId && !parentId){
            
        const notification= await notificationParentController.createNotificationParent([parentId],{
          title:'Nouveau message',
          desc:'Vous avez reçu un nouveau message',
          type:'message'
        });
        io.to(parentRoom.username).emit("newNotification", 
             notification.dataValues
            );
        await notificationParentController.sendPushNotificationToParent([parentId],notification.dataValues);

      } 

 });

 exports.replyMessage = catchAsync(async (req, res, next) => {
    const { subject,parentId,adminId, body }= req.body;
    const { subjectId } = req.params;
    if(!subject){
        throw new AppError('no subject found !',400);
    }
    if(!parentId && !adminId){
        throw new AppError('no parent or admin !',400);
    }
    if(!body){
        throw new AppError('no body !',400);
    }
    if(!subjectId){
        throw new AppError('no subjectId found !',400);
    }
    let messageExist;
    if (subjectId) {
        messageExist = await Message.findOne({
            where: {
                subjectId
            }
        });
    }

    if (messageExist) {
        if(parentId !== messageExist.parentId || adminId !== messageExist.adminId){
            throw new AppError('parent/admin ids and existed parent/admin ids are not the same !',400);
        }
    }
    
    let parent;
    if(parentId){
        parent = await Parent.findByPk(parentId);
        if(!parent){
            throw new AppError('parent doesn\'t exist !',404);
        }
    }
    let admin;
    if(adminId){
        admin = await Administrateur.findByPk(adminId);
                if(!admin){
                    throw new AppError('admin doesn\'t exist !',404);
                }
    }
    const message = await Message.create({
        subjectId,
        subject,
        body,
    });
    if(parentId){

        // await parentRoom.addRooms(message);
        await parent.addMessages(message);
    }
    if(adminId){
        // await parent.addRooms(message);
        await admin.addMessages(message);
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

    if(adminId && !parentId){
            
        const notification= await notificationParentController.createNotificationParent([parentId],{
          title:'Nouveau message',
          desc:'Vous avez reçu un nouveau message',
          type:'message'
        });
        io.to(parentRoom.username).emit("newNotification", 
             notification.dataValues
            );
        await notificationParentController.sendPushNotificationToParent([parentId],notification.dataValues);

      } 

 });

exports.getMessagesBySubjectId = catchAsync(async (req, res, next) => {
    const { subjectId } = req.params;
    const messages = await Message.findAll({
        where: {
            subjectId
        },
        order: [['createdAt', 'DESC']],
    });
    res.status(200).json({
        status: 'success',
        data: {
            messages
        }
    });
});

exports.getSubjectDistinctByParent = catchAsync(async(req,res,next)=>{
    const {subjectId,parentId} = req.params;

    const subjects = await Message.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('subjectId')), 'subjectId'],'subject','createdAt'],
        where:{
            parentId:parentId
        },
        order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        data: {
            subjects
        }
    });
});

exports.getSubjectDistinctByAdmin = catchAsync(async(req,res,next)=>{

    const subjects = await Message.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('subjectId')), 'subjectId'],'subject','createdAt'], 
        order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        data: {
            subjects
        }
    });
});