const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('node:fs');
const { users, messages } = require('./dbObjects');
const { Op } = require('sequelize');
const { time } = require('console');



const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(express.json());
app.use(express.static('public'));






io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('getUsers', async () => {
        const allUsers = await users.findAll();
        const simplifiedUsers = allUsers.map(user => {
            return { name: user.name, id: user.userId };
        });
        io.emit('users', simplifiedUsers);        
    });

    socket.on('addUser', async (name) => {
        const user = await users.findOne({ where: { name: name } });
        if (!user) {
            //create a random id for the user
            const id = Math.random().toString(36).substring(2);
            console.log('Creating user ' + name + ' ' + id);
            await users.create({ userId: id, name: name, socketId: socket.id });
        } else if (user.id !== socket.id) {
            await users.update({ socketId: socket.id }, { where: { name: name } });
            console.log('User already exists, updating socket id ' + name + ' ' + socket.id);
        }
        const allUsers = await users.findAll();
        io.emit('users', allUsers);
    });


    //https post requests to send messages

    app.post('/message', async (req, res) => {
        const { message, name, recipient } = req.body;
        const time = new Date();
        let privateMessage = false;
        if (!message || !name) {
            console.log('Invalid message or name');
            return res.sendStatus(400);
        }
        if (!recipient) {
            io.emit('message', message, name, time);
        } else {
            const recipientUser = await users.findOne({ where: { userId: recipient } });
            const senderUser = await users.findOne({ where: { name: name } });
            console.log('Private message to ' + recipientUser.name);
            privateMessage = true;
            io.to(recipientUser.socketId).emit('message', message, name, time, privateMessage);

            //save the message to the database
            await messages.create({ message: message, userId: senderUser.userId, recipientId: recipientUser.userId, time: time });
        }
        console.log(`[${time.toLocaleTimeString()}] ${name}: ${message}`);
        //send the client a response with the message and name and time
        res.send({ message, name, time, privateMessage });
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
