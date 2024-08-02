const express=require('express');
const cors=require('cors');
const bodyparser=require('body-parser');
const sequelize=require('./util/database');
const socketio=require('socket.io');
const http=require('http');

//import models
const User=require('./models/user');
const Group=require('./models/group');
const Message=require('./models/message');
const UserGroup=require('./models/usergroup');


const app=express();
app.use(cors());
app.use(bodyparser.json());

//import middleware
const authenticate=require('./middleware/authenticate');
const websocketauthenticate=require('./middleware/websocketauthenticate');

const server=http.createServer(app);
const io=socketio(server,{
  cors: {
      origin: '*',  // Adjust this to your client origin
  },
});

io.use(websocketauthenticate);


io.on('connection', (socket) => {
    console.log(`User connected`);
  
    socket.on('sendMessage', async (groupId, content) => {
      try {
        const message = await Message.create({
          groupId,
          userId: socket.user.id,
          content,
          username:socket.user.name
        });
        io.to(groupId).emit('newMessage', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('sendFile', async (groupId, url) => {
      try {
        const message = await Message.create({
            groupId,
            userId: socket.user.id,
            content: url.urllink,
            type: 'url',
            username:socket.user.name,
            filename:url.filename
        });
        io.to(groupId).emit('newMessage', message);
      } catch (error) {
          console.log('error sending fileUrl', error);
      }
    });
  
    socket.on('joinGroup', (groupId) => {
      socket.join(groupId);
      console.log(`User ${socket.user.name} joined group ${groupId}`);
    });
  
    socket.on('leaveGroup', (groupId) => {
      socket.leave(groupId);
      console.log(`User ${socket.user.name} left group ${groupId}`);
    });
  
    socket.on('disconnect', () => {
      console.log(`User  disconnected`);
    });
});
  

//import routes
const userauthroutes=require('./routes/user');
const grouproutes=require('./routes/group');
const messageroutes=require('./routes/message');

//associations
User.belongsToMany(Group, {through:UserGroup});
Group.belongsToMany(User,{through:UserGroup});
Group.hasMany(Message);
Message.belongsTo(Group);
User.hasMany(Message);
Message.belongsTo(User);

//use routes
app.use('/auth',userauthroutes);
app.use('/group',grouproutes);
app.use('/message',messageroutes);




// User.findByPk(1).then((user)=>{
//     console.log(Object.keys(user.__proto__)); // Outputs all methods available on user instance

// });// Example of fetching a user instance

// Check available methods

(async () => {
    try {
        await sequelize.sync({force:true});
        server.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    } catch (err) {
        console.log('Unable to start server : '+err);
    }
})();