const EventEmitter = require("events");
const Message = require("./src/message/messageModel");
const Parent = require("./src/parent/parentModel");
const Administrateur = require("./src/administrateur/administrateurModel");
module.exports = {
  listenSockets: (io, app) => {
    io.on("connection", (socket) => {
      console.log("Connected: " + socket.username);

      socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.username);
      });

      socket.on("joinRoom", ({ roomsId }) => {
        socket.join(roomsId);
        console.log("A user joined chatroom: " + roomsId);
      });

      socket.on("leaveRoom", ({ roomsId }) => {
        socket.leave(roomsId);
        console.log("A user left chatroom: " + roomsId);
      });

      //socket.on("chatroomMessage", async ({ chatroomId, message }) => {
      socket.on("chatroomMessage", async ({ roomsId,parentId,administrateurId, body }) => {
        try{
            let parent;
            let admin;
        if (body.trim().length > 0) {
            if (!parentId || !administrateurId){
                throw new Error('no parent or admin !')
            }
            if (!roomsId){
                throw new Error('no room !')
            } 
            if(!body){
                throw new Error('no body !')
            }
            const message = await Message.create({body});
            if(parentId){
                parent = await Parent.findByPk(parentId);
                if(!parent){
                    throw new Error('parent doesn\'t exist !');
                }
                if (parentId !== roomsId) {
                    throw new Error('parent id and room id are not the same !');
                }
                await parent.addRooms(message);
                await parent.addMessages(message);
            }
            if(administrateurId){
                admin = await Administrateur.findByPk(administrateurId);
                if(!admin){
                    throw new Error('admin doesn\'t exist !');
                }
                parent = await Parent.findByPk(roomsId);
                if(!parent){
                    throw new Error('parent doesn\'t exist !');
                }
                await parent.addRooms(message);
                await admin.addMessages(message);
            }
          
            
          io.to(roomsId).emit("newMessage", {
            body,
            roomsId,
            parentId,
            administrateurId,
            createAt: message.createAt,
          });


          // send notification to user
          // send push to user if he is outta the room

        }
            }catch(err){
            console.error(err)
        }
      });
    });
  },
};
