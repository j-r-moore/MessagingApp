const socket = io();
const messagesElement = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const privateMessageInput = document.getElementById('privateMessageInput');
const sendButton = document.getElementById('sendButton');
const addName = document.getElementById('nameInput');
const nameButton = document.getElementById('setNameButton');
const usersElement = document.getElementById('users');
const channelsElement = document.getElementById('channels');
const createChannelInput = document.getElementById('createChannelInput');
const createChannelButton = document.getElementById('createChannelButton');
const userChannelsElement = document.getElementById('userChannels');



sendButton.addEventListener('click', sendMessage);
nameButton.addEventListener('click', addUser);
createChannelButton.addEventListener('click', createChannel);

//when the page loads, request the users from the server
socket.emit('getUsers');

let Name = '';
let userId = '';
let channelID = '';



const consoleLogButton = document.getElementById('consoleLogButton');
consoleLogButton.addEventListener('click', consoleLog);
function consoleLog() {
    socket.emit('consoleLog');
}


socket.on('users', (users) => {
    usersElement.innerHTML = '';
    console.log('users being added' + users);
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user.name + ' - ' + user.userId;
        //add a button to login as the user
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login as ' + user.name;
        loginButton.addEventListener('click', () => {
            addName.value = user.name;
            userId = user.userId;
            addUser();
        });
        userElement.appendChild(loginButton);
        usersElement.appendChild(userElement);
    });
});

socket.on('channels', (channels) => {
    channelsElement.innerHTML = '';
    console.log('channels being added' + channels);
    channels.forEach(channel => {
        const channelElement = document.createElement('div');
        channelElement.textContent = channel.name + ' - ' + channel.channelId;
        //add a button to send messages to the channel
        const channelButton = document.createElement('button');
        channelButton.textContent = 'Send message to ' + channel.name;
        channelButton.addEventListener('click', () => {
            channelID = channel.channelId;
            //send post request to server to join the channel
            console.log('Inputs: ' + userId + ' ' + channelID);
            fetch('/joinChannel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    channelId: channelID,
                })
            })
        });
        channelElement.appendChild(channelButton);
        channelsElement.appendChild(channelElement);
    });
});

socket.on('userInfo', (user, channels) => {
    console.log('user info received: ' + user.name + ' ' + user.userId + ' ' + channels);
    userId = user.userId;
    Name = user.name;
    userChannelsElement.innerHTML = '';
    channels.forEach(channel => {
        const channelElement = document.createElement('div');
        channelElement.textContent = channel.name + ' - ' + channel.channelId;
        //add a button to send messages to the channel
        const channelButton = document.createElement('button');
        channelButton.textContent = 'Send message to ' + channel.name;
        channelButton.id = channel.channelId;
        channelButton.addEventListener('click', () => {
            channelID = channel.channelId;
            loadMessages();
        });
        channelElement.appendChild(channelButton);
        userChannelsElement.appendChild(channelElement);
    });
});
    


function addUser() {
    const name = addName.value.trim();
    if (name !== '') {
        socket.emit('addUser', name);
        Name = name;
        addName.value = '';

        // get info from server about the user
        socket.emit('getUserInfo', userId);
    }
}

function sendMessage() { //send message to server via post request
    const message = messageInput.value.trim();
    console.log('Inputs: ' + message + ' ' + Name + ' ' + userId + ' ' + channelID);
    if (message !== '') {
        fetch('/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                userId: userId,
                channelId: channelID,
            })
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            console.log(data);
            // Add the message to the messages list
            const messageElement = document.createElement('div');
            messageElement.textContent = data.message + ' - From: ' + data.name + ' - Time: ' + data.time + ' - Channel ID: ' + data.channelId;
            messagesElement.appendChild(messageElement);
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error(error);
        });
        messageInput.value = '';
    }
}


function createChannel() {
    const name = createChannelInput.value.trim();
    if (name !== '') {
        fetch('/createChannel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
            })
        })
        .then(response => {
            if (response.status === 201) {
                console.log('Channel created');
            } else {
                console.log('Channel already exists');
            }
        })
        .catch(error => {
            console.error(error);
        });
        createChannelInput.value = '';
    }
}


function loadMessages() {
    console.log('Inputs: ' + channelID);
    fetch('/loadMessages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            channelId: channelID,
        })
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log(data);
        // Add the messages to the messages list
        messagesElement.innerHTML = '';
        data.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.textContent = message.message + ' - From: ' + message.name + ' - Time: ' + message.time + ' - Channel ID: ' + message.channelId;
            messagesElement.appendChild(messageElement);
        });
    })
    .catch(error => {
        // Handle any errors that occur during the request
        console.error(error);
    });
}



socket.on('message', (message, name, time, channelId) => {
    console.log('message received: ' + message + ' ' + name + ' ' + time + ' ' + channelId);
    console.log('channelID: ' + channelID + ' channelId: ' + channelId);
    if (channelID !== channelId) { 
        //notifying the user that a message has been received in another channel by changing the color of the channel button for that channel
        const channelButton = document.getElementById(channelId);
        channelButton.style.backgroundColor = 'red';
        //after 5 seconds, change the color back to normal
        setTimeout(() => {
            channelButton.style.backgroundColor = '';
        }, 5000); 
    }    
    const messageElement = document.createElement('div');
    messageElement.textContent = message + ' - From: ' + name + ' - Time: ' + time + ' - Channel ID: ' + channelId;
    messagesElement.appendChild(messageElement);
});
