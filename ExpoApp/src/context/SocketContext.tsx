import React, { createContext, useState, useEffect, useContext } from 'react';
import { socket } from '../webSocket';

interface SocketContextType {
    friendRequests: any[];
    friendRequestAccepted: any[];
    newChannel: any[];
}

const defaultSocketContext = {
    friendRequests: [],
    friendRequestAccepted: [],
    newChannel: [],
};


const SocketContext = createContext<SocketContextType>(defaultSocketContext);

export const SocketProvider = ({ children }) => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendRequestAccepted, setFriendRequestAccepted] = useState([]);
    const [newChannel, setNewChannel] = useState([]);

    let socketConnect = false;

    

    useEffect(() => {
        if (!socket.connected) {
            socket.close();
            socket.connect();
            console.log('Socket connecting');
        } else {
            console.log('Socket already connected'); 
            console.log('Socket ID:', socket.id);
            socketConnect = true;
        }

        socket.on('connect', () => {
            console.log('Socket connected');
            console.log('Socket ID:', socket.id); 
            socketConnect = true;
        });

        socket.on('disconnect', () => {  
            socketConnect = false;
            console.log('Socket disconnected');
            const intervalId = setInterval(() => {
                if (!socketConnect) {
                    socket.connect();   
                    console.log('Socket reconnecting');
                } else {
                    console.log('Socket reconnected');
                    socketConnect = true;
                    clearInterval(intervalId);
                }           
            }, 1000);
        });
         

        socket.on('friendRequest', (data) => {
            console.log('Friend request:', data); 
            setFriendRequests((prev) => [...prev, data]);
        });

        socket.on('friendRequestAccepted', (data) => {
            console.log('Friend request accepted:', data);
            setFriendRequests((prev) => prev.filter((request) => request.id !== data.id));
            setFriendRequestAccepted((prev) => [...prev, data]);
        });

        socket.on('newChannel', (data) => {
            console.log('New channel:', data);
            setNewChannel((prev) => [...prev, data]);
        });

        socket.on('usersStatusUpdate', (data) => {
            console.log('Users status update:', data);
        });

        return () => {
            socket.off('friendRequest'); 
            socket.off('friendRequestAccepted');
            socket.off('newChannel');
        };
    }, []);

    return (
        <SocketContext.Provider value={{ friendRequests, friendRequestAccepted, newChannel }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    return useContext(SocketContext);
}