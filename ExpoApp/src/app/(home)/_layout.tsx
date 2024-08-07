import { Stack } from "expo-router";
import React from 'react';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
            <Stack.Screen name="messages" options={{ title: 'Messages' }} />
        </Stack>
    );
}