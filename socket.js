const EventEmitter = require("events");
const Message = require("./src/message/messageModel");
const Parent = require("./src/parent/parentModel");
const Administrateur = require("./src/admin/adminModel");
const notificationParentController = require("./src/notificationParent/notificationParentController");
const notificationAdminController = require("./src/notificationAdmin/notificationAdminController");
const notificationCoachController = require("./src/notificationCoach/notificationCoachController");
module.exports = {
  listenSockets: (io, app) => {
    io.on("connection", (socket) => {
      console.log("Connected: " + socket.username);

      socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.username);
      });

      

      socket.on("joinNotificationRoom", (data) => {
        
        socket.join(data.username);
        console.log("A user joined notification room: " + data.username);
      });

      let nodeEventEmitter = app.get("nodeEventEmitter")
      if(!nodeEventEmitter){
        nodeEventEmitter = new EventEmitter();
        app.set("nodeEventEmitter", nodeEventEmitter); // set nodeEventEmitter to express app so that we can access it from anywhere
      }
      
      nodeEventEmitter.on("send_message_to_all_parents",async (data) => {
        try {
          const parents = await Parent.findAll({
            where:{status:'actif'}
          });
          const ids = parents.map(parent => parent.id);
          const usernames = parents.map(parent => parent.username);
  
         const messageBody={
            body:data.message,
            roomsId:id,
            parentId:undefined,
            adminId:data.admin.userId,
          }
  
          const message = await Message.create({body});

         await Promise.all(parents.map(async parent => await parent.addRooms(message)));
          await data.admin.addMessage(message);
  
          ids.forEach(id => {
            io.to(id).emit("newMessage",{
              body:messageBody.body,
              roomsId:messageBody.roomsId,
              parentId:messageBody.parentId,
              adminId:messageBody.adminId,
              createAt: message.createAt,
            })
          });

          const notification= await notificationParentController.createNotificationParent([roomsId],{
            title:'Nouveau message',
            desc:'Vous avez reçu un nouveau message',
            type:'message'
          });

          usernames.forEach(username=>{
            io.to(username).emit("newNotification", 
               notification.dataValues
              );
          });
          
          await notificationParentController.sendPushNotificationToParent([ids],notification.dataValues);

          nodeEventEmitter.emit('message_sent_to_all_parents',{status:'success'});
          
          
        } catch (error) {
          console.error(error);
          nodeEventEmitter.emit('message_sent_to_all_parents',{status:'error'});
        }
        
        
      });


      nodeEventEmitter.on("send_new_evaluation",async (data) => {
        const admins = await Administrateur.findAll({
          attributes:['username','id'],
          where:{
            adminLevel:'superadmin'
          },
          raw:true
        });
        const ids= admins.map((admin)=>admin.id);
        const usernames = admins.map((admin)=>admin.username);
        const notification = await notificationAdminController.createNotificationAdmin(ids,{
          title:data.title,
          desc:data.body,
          type:data.type
        });
        usernames.forEach((username)=>{
          io.to(username).emit("newNotification", notification.dataValues);
        });
        await notificationAdminController.sendPushNotificationToAdmin(ids,notification.dataValues);


      });


      nodeEventEmitter.on("send_status_evaluation",async (data) => {
        console.log('Data we are getting from send status evaluation',data)
        if (data.etatEvaluation === 'accepted') {
          const notificationBodyCoach = {
            title:'Evaluation acceptée',
            desc:`L\'evaluation de l\'élève ${data.student.prenomEleve} ${data.student.nomEleve} a été acceptée`,
            type:'evaluation'
        }
          const notificationBodyParent = {
            title:'Nouvelle Evaluation',
            desc:`Vous avez une nouvelle evaluation de l\'élève ${data.student.prenomEleve} ${data.student.nomEleve}.`,
            type:'evaluation'
        }
          // const notificationParent = await notificationParentController.createNotificationParent([data.parentId],notificationBodyParent);
          const notificationCoach = await notificationCoachController.createNotificationCoach([data.coachId],notificationBodyCoach);
          // io.to(data.parentUsername).emit("newNotification", notificationParent.dataValues);
          io.to(data.coachUsername).emit("newNotification", notificationCoach.dataValues);
          // await notificationParentController.sendPushNotificationToParent([data.parentId],notificationParent.dataValues);
          await notificationCoachController.sendPushNotificationToCoach([data.coachId],notificationCoach.dataValues);
      }
      if (data.etatEvaluation === 'blocked') {
        const notificationBodyCoach = {
          title:'Evaluation refusée',
          desc:`L\'evaluation de l\'élève ${data.student.prenomEleve} ${data.student.nomEleve} a été refusée`,
          type:'evaluation'
      }
      const notificationCoach = await notificationCoachController.createNotificationCoach([data.coachId],notificationBodyCoach);
      io.to(data.coachUsername).emit("newNotification", notificationCoach.dataValues);
      await notificationCoachController.sendPushNotificationToCoach([data.coachId],notificationCoach.dataValues);
      
    }
      })

      nodeEventEmitter.on("newNotification", (data) => {
        const usernames = data.usernames;
        const notification = data.notification;
        usernames.forEach((username)=>{
          io.to(username).emit("newNotification", notification);
        });
        
      });

      socket.on("leaveRoom", (data) => {
        socket.leave(data.roomsId);
        console.log("A user left chatroom: " + data.roomsId);
      });

      //socket.on("chatroomMessage", async ({ chatroomId, message }) => {
      // socket.on("chatroomMessage", async (data) => {
      //   try{
      //     const { roomsId,parentId,adminId, body }=data;
      //       let parent;
      //       let admin;
      //   if (body.trim().length > 0) {
      //       if (!parentId || !adminId){
      //           throw new Error('no parent or admin !')
      //       }
      //       if (!roomsId){
      //           throw new Error('no room !')
      //       } 
      //       if(!body){
      //           throw new Error('no body !')
      //       }
      //       const message = await Message.create({body});
      //       parentRoom = await Parent.findByPk(roomsId);
      //       if(!parentRoom){
      //           throw new Error('parent doesn\'t exist !');
      //       }
      //       if(parentId){
      //           if (parentId !== roomsId) {
      //               throw new Error('parent id and room id are not the same !');
      //           }
      //           await parentRoom.addRooms(message);
      //           await parentRoom.addMessages(message);
      //       }
      //       if(adminId){
      //           admin = await Administrateur.findByPk(adminId);
      //           if(!admin){
      //               throw new Error('admin doesn\'t exist !');
      //           }
                
      //           await parent.addRooms(message);
      //           await admin.addMessage(message);
      //       }
          
            
      //     io.to(roomsId).emit("newMessage", {
      //       body,
      //       roomsId,
      //       parentId,
      //       adminId,
      //       createAt: message.createAt,
      //     });

      //     if(parentId && !adminId) {

      //       const admins = await Administrateur.findAll({
      //         attributes:['username','id'],
      //         raw:true
      //       })
      //       if(admins.length > 0) {
      //         const ids= admins.map((admin)=>admin.id);
      //         const usernames = admins.map((admin)=>admin.username);
      //        const notification= await notificationAdminController.createNotificationAdmin(ids,{
      //           title:'Nouveau message',
      //           desc:`${parent.prenomParent} ${parent.nomParent} vous a envoyé un nouveau message`,
      //           type:'message'
      //         });
      //         usernames.forEach((admin)=>{
      //           io.to(admin).emit("newNotification", notification.dataValues);
      //         });
      //         await notificationAdminController.sendPushNotificationToAdmin(ids,notification.dataValues);
      //       }
      //     }
      //     if(adminId && !parentId){
            
      //       const notification= await notificationParentController.createNotificationParent([roomsId],{
      //         title:'Nouveau message',
      //         desc:'Vous avez reçu un nouveau message',
      //         type:'message'
      //       });
      //       io.to(parentRoom.username).emit("newNotification", 
      //        notification.dataValues
      //       );

      //       await notificationParentController.sendPushNotificationToParent([roomsId],notification.dataValues);

      //     }
          
      //   }
      //       }catch(err){
      //       console.error(err)
      //   }
      // });
    });
  },
};
