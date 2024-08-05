import React, { createContext, useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const reconnectAttempts = useRef(0);

    useEffect(() => {
        const connectWebSocket = () => {
            const newSocket = io('https://jaydenmoore.net');

            newSocket.on('connect', () => {
                console.log('WebSocket connection opened');
                reconnectAttempts.current = 0; // Reset reconnection attempts on successful connection
            });

            newSocket.on('disconnect', () => {
                console.log('WebSocket connection closed');
                if (reconnectAttempts.current < 5) {
                    reconnectAttempts.current += 1;
                    console.log(`Reconnecting attempt ${reconnectAttempts.current}`);
                    setTimeout(connectWebSocket, 1000); // Attempt to reconnect after 1 second
                } else {
                    console.log('Max reconnection attempts reached');
                }
            });

            newSocket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    );
};

export { WebSocketProvider, WebSocketContext }; // Export the WebSocketProvider and WebSocketContext