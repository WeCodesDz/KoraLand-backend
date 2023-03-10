const Sequelize = require('sequelize');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Message = require('./messageModel');
const Parent = require('../parent/parentModel');
const Administrateur = require('../admin/adminModel');
const notificationParentController = require("../notificationParent/notificationParentController");
const notificationAdminController = require("../notificationAdmin/notificationAdminController");
const notificationCoachController = require("../notificationCoach/notificationCoachController");

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
    const { subject,parentId,adminId, body,senderId }= req.body;
    if(!subject){
        throw new AppError('no subject found !',400);
    }
    if(!parentId || !adminId){
        throw new AppError('no parent or admin !',400);
    }
    if(!body){
        throw new AppError('no body !',400);
    }
    if(!senderId){
        throw new AppError('no senderId !',400);
    }
    if(senderId !== parentId && senderId !== adminId){
        throw new AppError('senderId is not the same as parentId or adminId !',400);
    }
    let sender = adminId===senderId ? 'admin' : 'parent';
    let subjectId = subject+''+Date.now();
    subjectId = subjectId.replace(/\s/g, '_');
    

    const message = await Message.create({
        subjectId,
        subject,
        body,
    });
    if(sender === 'parent'){
        let parent;
        parent = await Parent.findByPk(parentId);
        if(!parent){
            throw new AppError('parent doesn\'t exist !',404);
        }
        
        await parent.addMessages(message);

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
            const nodeEventEmitter = req.app.get('nodeEventEmitter')
            const data = {
                usernames,
                notification:notification.dataValues
                
            }
            if(nodeEventEmitter){
              nodeEventEmitter.emit('newNotification',data);
            }
            // usernames.forEach((admin)=>{
            //   io.to(admin).emit("newNotification", notification.dataValues);
            // });
            await notificationAdminController.sendPushNotificationToAdmin(ids,notification.dataValues);
          }
    }
    if(sender === 'admin'){
        let admin;
        admin = await Administrateur.findByPk(adminId);
                if(!admin){
                    throw new AppError('admin doesn\'t exist !',404);
                }
        const parent = await Parent.findByPk(parentId);
        await admin.addMessages(message);

        const notification= await notificationParentController.createNotificationParent([parentId],{
            title:'Nouveau message',
            desc:'Vous avez reçu un nouveau message',
            type:'message'
          });
          const nodeEventEmitter = req.app.get('nodeEventEmitter')
            const data = {
                usernames:[parent.username],
                notification:notification.dataValues
            }
            if(nodeEventEmitter){
              nodeEventEmitter.emit('newNotification',data);
            }
          await notificationParentController.sendPushNotificationToParent([parentId],notification.dataValues);
  
    }
    res.status(201).json({
        status: 'success',
        data: {
            message
        }
    });   
 });

 exports.replyMessage = catchAsync(async (req, res, next) => {
    const { parentId,adminId, body ,senderId}= req.body;
    const { subjectId } = req.params;
    
    if(!parentId || !adminId){
        throw new AppError('no parent or admin !',400);
    }
    if(!body){
        throw new AppError('no body !',400);
    }
    if(!subjectId){
        throw new AppError('no subjectId found !',400);
    }
    if(!senderId){
        throw new AppError('no senderId !',400);
    }
    if(senderId !== parentId && senderId !== adminId){
        throw new AppError('senderId is not the same as parentId or adminId !',400);
    }

    let sender = adminId===senderId ? 'admin' : 'parent';
    let messageExist;
    if (subjectId) {
        messageExist = await Message.findOne({
            where: {
                subjectId
            }
        });
        if (!messageExist) {
            throw new AppError('no discussion found !',404);
        }
    }

    if (messageExist) {
        if(parentId !== messageExist.parentId && adminId !== messageExist.adminId){
            throw new AppError('parent/admin ids and existed parent/admin ids are not the same !',400);
        }
    }

    const message = await Message.create({
        subjectId,
        subject:messageExist.subject,
        body,
    });
    if(sender === 'parent'){
        let parent;
        parent = await Parent.findByPk(parentId);
        if(!parent){
            throw new AppError('parent doesn\'t exist !',404);
        }
        
        await parent.addMessages(message);

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
            const nodeEventEmitter = req.app.get('nodeEventEmitter')
            const data = {
                usernames,
                notification:notification.dataValues
            }
            if(nodeEventEmitter){
              nodeEventEmitter.emit('newNotification',data);
            }
            await notificationAdminController.sendPushNotificationToAdmin(ids,notification.dataValues);
          }
    }
    if(sender === 'admin'){
        let admin;
        admin = await Administrateur.findByPk(adminId);
                if(!admin){
                    throw new AppError('admin doesn\'t exist !',404);
                }
        const parent = await Parent.findByPk(parentId);        
        await admin.addMessages(message);

        const notification= await notificationParentController.createNotificationParent([parentId],{
            title:'Nouveau message',
            desc:'Vous avez reçu un nouveau message',
            type:'message'
          });
          const nodeEventEmitter = req.app.get('nodeEventEmitter')
            const data = {
                usernames:[parent.username],
                notification:notification.dataValues
            }
            if(nodeEventEmitter){
              nodeEventEmitter.emit('newNotification',data);
            }
          await notificationParentController.sendPushNotificationToParent([parentId],notification.dataValues);
  
    }
    res.status(201).json({
        status: 'success',
        data: {
            message
        }
    });
    
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
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('subjectId')), 'subjectId'],  "body", "createdAt", "parentId", "adminId",'subject'], 
        order: [['createdAt', 'DESC']],
        include: [Parent]
    });

    res.status(200).json({
        status: 'success',
        data: {
            subjects
        }
    });
});