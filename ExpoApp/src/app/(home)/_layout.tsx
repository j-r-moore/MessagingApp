import { Redirect, Stack } from "expo-router";
import React from 'react';

import { useSession } from '../../storeToken';

export default function Layout() {
    const { session } = useSession();
    
    if (!session) {
        console.log('Redirecting to login');
        return <Redirect href="../login" />;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
            <Stack.Screen name="messages" options={{ title: 'Messages' }} />
        </Stack>
    );

}