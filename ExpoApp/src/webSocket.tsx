import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

//have some fuctions to handle when the socket emits an event to do with channels
useEffect(() => {
    socket.on('channelCreated', (channel) => {
        console.log('Channel created:', channel);
        // setChannels((prevChannels) => [...prevChannels, channel]);
    });

    socket.on('channelDeleted', (channelId) => {
        console.log('Channel deleted:', channelId);
        // setChannels((prevChannels) => prevChannels.filter((channel) => channel.channelId !== channelId));
    });

    return () => {
        socket.off('channelCreated');
        socket.off('channelDeleted');
    };
}, []);

export const socket = io('https://jaydenmoore.net');
