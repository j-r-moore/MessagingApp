import { Stack } from "expo-router";
import React from 'react';
import { WebSocketProvider } from '../../webSocket';

export default function Layout() {
    return (
        <WebSocketProvider>  
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
                <Stack.Screen name="messages" options={{ title: 'Messages' }} />
            </Stack>
        </WebSocketProvider>
    );
}