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







//error handling for socket.io
io.on('error', (err) => {
    console.log(err);
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });



        
    app.post('/signup', async (req, res) => {
        const { name, username, email, password } = req.body;
        const socketId = socket.id;
        if (!name || !email || !password) {
            console.log('Invalid name or email or password');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { email: email } });
        if (user) {
            console.log('User already exists');
            return res.sendStatus(409);
        }
        const usernameCheck = await users.findOne({ where: { username: username } });
        if (usernameCheck) {
            console.log('Username already exists');
            return res.sendStatus(409);
        }
        //token is a random string that is generated when the user signs up or logs in
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await users.create({ name: name, email: email, hashedPassword: password, token: token, status: 1, statusMessage: '', socketId: socketId, username: username });
        console.log('User created');
        //send token to client
        res.send({ token });
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const socketId = socket.id;
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
        await users.update({ token: token, socketId: socketId }, { where: { email: email, hashedPassword: password } });
        console.log('User logged in, token updated, and socket id updated: ' + socketId);
        //send token to client
        res.send({ token });
    });


    app.post('/myData', async (req, res) => {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            console.log('Invalid token');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { token: token } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }

        //send the user non-sensitive information and all the user's friends and channels
        const userChannels = await channelLink.findAll({ where: { userId: user.userId } });
        const channelsData = await channels.findAll({ where: { channelId: { [Op.in]: userChannels.map(channel => channel.channelId) } } });

        const userFriends = await friends.findAll({ where: { [Op.or]: [{ userId1: user.userId }, { userId2: user.userId }] } });
        userFriends = userFriends.filter(friend => friend.pending === false);
        const friendsList = await users.findAll({ where: { userId: { [Op.in]: userFriends.map(friend => friend.userId1).concat(userFriends.map(friend => friend.userId2)) } } });
        friendsList.forEach(friend => {
            friend = { name: friend.name, status: friend.status, statusMessage: friend.statusMessage, userId: friend.userId, username: friend.username };
        });

        const pendingFriends = await friends.findAll({ where: { userId2: user.userId } });
        // this means it should only get the friends that have added this user
        // e.g if blake has added me then he would be user id 1 and i would be user id 2
        // so this means user id 2 will be me only if another user has added me like blake
        
        pendingFriends = pendingFriends.filter(friend => friend.pending === true);

        // get the user information for the users that have added this user
        const pendingFriendsList = await users.findAll({ where: { userId: { [Op.in]: pendingFriends.map(friend => friend.userId1) } } });
        pendingFriendsList.forEach(friend => {
            friend = { name: friend.name, userId: friend.userId, username: friend.username };
        });

        const userInformation = { name: user.name, status: user.status, statusMessage: user.statusMessage, userId: user.userId, username: user.username };
        console.log('User data sent ' + userInformation);

        res.send({ userInformation, channelsData, friendsList, pendingFriendsList });
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



    //This is the function that will be called when a user sends a message
    //It will send the message to all users in the channel by using the channelId and looking in the 
    //channelLink table for all users in the channel, then looking in the users table for the socketId of the user
    //and sending the message to all the socketIds
    app.post('/message', async (req, res) => {
        const { message, userId, channelId } = req.body;
        const { token } = req.headers.authorization.split(' ')[1];
        console.log('Message: ' + message + ' User ID: ' + userId + ' Channel ID: ' + channelId);
        const time = new Date();
        if (!message || !userId || !channelId || !token) {
            console.log('Invalid message or userId or channelId');
            return res.sendStatus(400);
        }
       
        const senderUser = await users.findOne({ where: { userId: userId } });
        if (!senderUser) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        if (senderUser.token !== token) {
            console.log('Invalid token');
            return res.sendStatus(403);
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
            io.to(user.socketId).emit('message', message, senderName, time, channelId, userId);
        });
        //save the message to the database
        await messages.create({ message: message, userId: senderUser.userId, time: time, channelId: channelId });
        
        console.log(`[${time.toLocaleTimeString()}] ${senderUser.name} sent a message to channel ${channel.name}: ${message}`);
        res.send({ message, name: senderUser.name, time, channelId: channelId });
    });

    //create a channel
    app.post('/createChannel', async (req, res) => {
        const { name } = req.body;
        const { token } = req.headers.authorization.split(' ')[1];
        if (!name || !token) {
            console.log('Invalid channel name or token');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { token: token } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        //we dont need to check if the channel already exists because the channel name is not unique
        // const channel = await channels.findOne({ where: { name: name } });
        // if (channel) {
        //     console.log('Channel already exists');
        //     return res.sendStatus(409);
        // }
        const newChannel = await channels.create({ name: name });
        console.log('Channel created');
        // user join channel
        await channelLink.create({ userId: user.userId, channelId: newChannel.channelId });
        console.log('User joined channel');
        res.send({ channelId: newChannel.channelId, name: newChannel.name });
    });

    //join a channel
    app.post('/joinChannel', async (req, res) => {
        const { userId, channelId } = req.body;
        const { token } = req.headers.authorization.split(' ')[1];
        if (!userId || !channelId || !token) {
            console.log('Invalid userId or channelId or token');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { userId: userId } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        if (user.token !== token) {
            console.log('Invalid token');
            return res.sendStatus(403);
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
        const joinedChannel = await channelLink.create({ userId: userId, channelId: channelId });
        console.log('User joined channel');
        res.send({ channelId: joinedChannel.channelId, name: channel.name });
    });

    //load messages from a channel
    app.post('/loadMessages', async (req, res) => {
        const { channelId, lastMessageId } = req.body;
        const { token } = req.headers.authorization.split(' ')[1];
        console.log('Loading messages for channel ' + channelId + ' from message ' + lastMessageId);
        if (!channelId || !token) {
            console.log('Invalid channelId or token');
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

        //make sure the user is in the channel
        const user = await users.findOne({ where: { token: token } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        const userInChannel = await channelLink.findOne({ where: { userId: user.userId, channelId: channelId } });
        if (!userInChannel) {
            console.log('User not in channel');
            return res.sendStatus(403);
        }

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


    app.post('/addFriend', async (req, res) => {
        const { userId, friendUsername } = req.body;
        const { token } = req.headers.authorization.split(' ')[1];
        

        if (!userId || !friendUsername || !token) {
            console.log('Invalid userId or friendUsername or token');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { token: token } });
        if (!user) {
            console.log('User not found, or token invalid');
            return res.sendStatus(404);
        }
        const friend = await users.findOne({ where: { username: friendUsername } });
        if (!friend) {
            console.log('Friend not found');
            return res.sendStatus(404);
        }
        const userFriend = await friends.findOne({
            where: {
                [Op.or]: [
                    { userId1: userId, userId2: friend.userId },
                    { userId1: friend.userId, userId2: userId }
                ]
            }
        });


        if (userFriend) {
            console.log('Friend already exists');
            return res.sendStatus(409);
        }
        await friends.create({ userId1: userId, userId2: friend.userId, pending: true });
        console.log('Friend added');
        res.sendStatus(200);
    });

    app.post('/acceptFriend', async (req, res) => {
        const { userId, friendId } = req.body;
        const { token } = req.headers.authorization.split(' ')[1];
        if (!userId || !friendId || !token) {
            console.log('Invalid userId or friendId or token');
            return res.sendStatus(400);
        }
        const user = await users.findOne({ where: { token: token } });
        if (!user) {
            console.log('User not found');
            return res.sendStatus(404);
        }
        const friend = await users.findOne({ where: { userId: friendId } });
        if (!friend) {
            console.log('Friend not found');
            return res.sendStatus(404);
        }
        const userFriend = await friends.findOne({
            where: {
                [Op.or]: [
                    { userId1: userId, userId2: friendId },
                    { userId1: friendId, userId2: userId }
                ]
            }
        });
        if (!userFriend) {
            console.log('Friend not found');
            return res.sendStatus(404);
        }
        if (userFriend.pending === false) {
            console.log('Friend already accepted');
            return res.sendStatus(409);
        }
        await friends.update({ pending: false }, {
            where: {
                [Op.or]: [
                    { userId1: userId, userId2: friendId },
                    { userId1: friendId, userId2: userId }
                ]
            }
        });
        console.log('Friend accepted');
        res.sendStatus(200);
    });
        



    
    // This function is now handled by the login/signup post requests
    // socket.on('addUser', async (name) => {
    //     const user = await users.findOne({ where: { name: name } });
    //     if (!user) {
    //         //create a random id for the user
    //         console.log('Creating user ' + name + ' ' + socket.id);
    //         await users.create({ name: name, socketId: socket.id, status: 1, statusMessage: '' });
    //     } else if (user.socketId !== socket.id) {
    //         await users.update({ socketId: socket.id }, { where: { name: name } });
    //         console.log('User already exists, updating socket id ' + name + ' ' + socket.id);
    //     }
    //     const allUsers = await users.findAll();
    //     io.emit('users', allUsers);
    // });

    // this is now handled by the Userinfo post request
    // socket.on('getUserInfo', async (userId) => {
    //     console.log('Getting user info for user ' + userId);
    //     const user = await users.findOne({ where: { userId: userId } });
    //     // const userFriends = 
    //     const channelLinks = await channelLink.findAll({ where: { userId: userId } });
    //     const channelNames = await channels.findAll({ where: { channelId: { [Op.in]: channelLinks.map(channelLink => channelLink.channelId) } } });
    //     //send the channel names and ids to the user
    //     const userChannels = channelNames.map(channel => {
    //         return { name: channel.name, channelId: channel.channelId };
    //     });
    //     if (!user) {
    //         console.log('User not found');
    //         return;
    //     }
    //     io.to(socket.id).emit('userInfo', user, userChannels);
    // });




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
