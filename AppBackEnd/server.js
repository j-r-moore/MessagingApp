const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Server } = require('socket.io');
const fs = require('node:fs');
const { users, messages, channels, channelLink, friends } = require('./dbObjects');
const { Op } = require('sequelize');
const { time } = require('console');



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});


app.use(express.json());
app.use(express.static('public'));




app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        console.log('Invalid name or email or password');
        return res.sendStatus(400);
    }
    const user = await users.findOne({ where: { email: email } });
    if (user) {
        console.log('User already exists');
        return res.sendStatus(409);
    }
    //token is a random string that is generated when the user signs up or logs in
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await users.create({ name: name, email: email, hashedPassword: password, token: token, status: 1, statusMessage: '' });
    console.log('User created');
    //send token to client
    res.send({ token });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log('Invalid email or password');
        return res.sendStatus(400);
    }
    const user = await users.findOne({ where: { email: email, hashedPassword: password } });
    if (!user) {
        console.log('User not found');
        return res.sendStatus(404);
    }
    //token is a random string that is generated when the user signs up or logs in
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await users.update({ token: token }, { where: { email: email } });
    console.log('User logged in');
    //send token to client
    res.send({ token });
});



//error handling for socket.io
io.on('error', (err) => {
    console.log(err);
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });



    socket.on('getUsers', async () => {
        const allUsers = await users.findAll();
        const simplifiedUsers = allUsers.map(user => {
            return { name: user.name, userId: user.userId };
        });
        console.log('Sending users to client');
        console.log(simplifiedUsers);
        io.emit('users', simplifiedUsers);  
        io.emit('channels', await channels.findAll());      
    });

    app.post('/upateSocketId', async (req, res) => {
        const { token, socketId } = req.body;
        if (!token || !socketId) {
            console.log('Invalid token or socketId');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { token: token } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        await users.update({ socketId: socketId }, { where: { token: token } });
        console.log('Socket id updated');
        res.sendStatus(200);
    });




    socket.on('addUser', async (name) => {
        const user = await users.findOne({ where: { name: name } });
        if (!user) {
            //create a random id for the user
            console.log('Creating user ' + name + ' ' + socket.id);
            await users.create({ name: name, socketId: socket.id, status: 1, statusMessage: '' });
        } else if (user.socketId !== socket.id) {
            await users.update({ socketId: socket.id }, { where: { name: name } });
            console.log('User already exists, updating socket id ' + name + ' ' + socket.id);
        }
        const allUsers = await users.findAll();
        io.emit('users', allUsers);
    });

    socket.on('getUserInfo', async (userId) => {
        console.log('Getting user info for user ' + userId);
        const user = await users.findOne({ where: { userId: userId } });
        // const userFriends = 
        const channelLinks = await channelLink.findAll({ where: { userId: userId } });
        const channelNames = await channels.findAll({ where: { channelId: { [Op.in]: channelLinks.map(channelLink => channelLink.channelId) } } });
        //send the channel names and ids to the user
        const userChannels = channelNames.map(channel => {
            return { name: channel.name, channelId: channel.channelId };
        });
        if (!user) {
            console.log('User not found');
            return;
        }
        io.to(socket.id).emit('userInfo', user, userChannels);
    });



    //This is the function that will be called when a user sends a message
    //It will send the message to all users in the channel by using the channelId and looking in the 
    //channelLink table for all users in the channel, then looking in the users table for the socketId of the user
    //and sending the message to all the socketIds
    app.post('/message', async (req, res) => {
        const { message, userId, channelId } = req.body;
        console.log('Message: ' + message + ' User ID: ' + userId + ' Channel ID: ' + channelId);
        const time = new Date();
        if (!message || !userId || !channelId) {
            console.log('Invalid message or userId or channelId');
            return res.sendStatus(400);
        }
       
        const senderUser = await users.findOne({ where: { userId: userId } });
        if (!senderUser) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        const channel = await channels.findOne({ where: { channelId: channelId } });
        if (!channel) {
            console.log('Channel not found');
            return res.sendStatus(404);
        }
        //users that are in the channel, use channelId to find all users in the channel from channelLink
        const channelUsers = await channelLink.findAll({ where: { channelId: channelId } });
        //send the message to all users in the channel
        //get the socket id of the user from the users table     
        const channelUsersList = channelUsers.map(user => user.userId);
        const user = await users.findAll({ where: { userId: { [Op.in]: channelUsersList } } });
        senderName = senderUser.name;
        user.forEach(user => {
            if (user.userId === userId) {
                return;
            }
            io.to(user.socketId).emit('message', message, senderName, time, channelId );
        });
        //save the message to the database
        await messages.create({ message: message, userId: senderUser.userId, time: time, channelId: channelId });
        
        console.log(`[${time.toLocaleTimeString()}] ${senderUser.name} sent a message to channel ${channel.name}: ${message}`);
        res.send({ message, name: senderUser.name, time, channelId: channelId });
    });

    //create a channel
    app.post('/createChannel', async (req, res) => {
        const { name } = req.body;
        if (!name) {
            console.log('Invalid channel name');
            return res.sendStatus(400);
        }
        const channel = await channels.findOne({ where: { name: name } });
        if (channel) {
            console.log('Channel already exists');
            return res.sendStatus(409);
        }
        await channels.create({ name: name });
        console.log('Channel created');
        //send the updated list of channels to all users
        const allChannels = await channels.findAll();
        io.emit('channels', allChannels);
        res.sendStatus(201);
    });

    //join a channel
    app.post('/joinChannel', async (req, res) => {
        const { userId, channelId } = req.body;
        if (!userId || !channelId) {
            console.log('Invalid userId or channelId');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { userId: userId } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        const channel = await channels.findOne({ where: { channelId: channelId } });
        if (!channel) {
            console.log('Channel not found');
            return res.sendStatus(404);
        }
        const channelUser = await channelLink.findOne({ where: { userId: userId, channelId: channelId } });
        if (channelUser) {
            console.log('User already in channel');
            return res.sendStatus(409);
        }
        await channelLink.create({ userId: userId, channelId: channelId });
        console.log('User joined channel');
        res.sendStatus(200);
    });

    //load messages from a channel
    app.post('/loadMessages', async (req, res) => {
        const { channelId, lastMessageId } = req.body;
        console.log('Loading messages for channel ' + channelId + ' from message ' + lastMessageId);
        if (!channelId) {
            console.log('Invalid channelId');
            return res.sendStatus(400);
        }
        const channel = await channels.findOne({ where: { channelId: channelId } });
        if (!channel) {
            console.log('Channel not found');
            return res.sendStatus(404);
        }

        //find the users in the channel so you can link the messages to the users
        const channelUsers = await channelLink.findAll({ where: { channelId: channelId } });
        const channelUsersList = channelUsers.map(user => user.userId);
        const usersInChannel = await users.findAll({ where: { userId: { [Op.in]: channelUsersList } } });

        //only load the last 100 messages from the last loaded message
        if (lastMessageId) {
            const lastMessage = await messages.findOne({ where: { messageId: lastMessageId } });
            if (!lastMessage) {
                console.log('Last message not found');
                return res.sendStatus(404);
            }
            const allMessages = await messages.findAll({ where: { channelId: channelId, messageId: { [Op.gt]: lastMessageId } }, limit: 100 }); //limit to 100 messages from the last message. op.gt is greater than
            const simplifiedMessages = allMessages.map(message => {
                const user = usersInChannel.find(user => user.userId === message.userId);
                return { message: message.message, name: user.name, time: message.time, messageId: message.messageId, userId: message.userId };
            });
            console.log(`Sending messages to client from message ${lastMessageId}`);
            console.log(simplifiedMessages);
            res.send(simplifiedMessages);
        } else {
            const allMessages = await messages.findAll({ where: { channelId: channelId }, limit: 100 });
            const simplifiedMessages = allMessages.map(message => {
                const user = usersInChannel.find(user => user.userId === message.userId);
                return { message: message.message, name: user.name, time: message.time, messageId: message.messageId, userId: message.userId };
            });
            console.log('Sending messages to client');
            console.log(simplifiedMessages);
            res.send(simplifiedMessages);
        }
        
    });





    socket.on('consoleLog', () => {
        //console log all connected users with their id
        console.log('Connected users:');
        for (const [id, socket] of io.of('/').sockets) {
            console.log('ID:', id);
        }
        
        console.log('All users:');
        users.findAll().then(users => {
            users.forEach(user => {
                console.log(user.name + ' - ' + user.userId + ' - ' + user.socketId);
            });
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
