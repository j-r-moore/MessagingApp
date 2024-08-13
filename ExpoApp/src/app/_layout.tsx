// Define global providers

import { Slot, Stack } from 'expo-router' ;
import { SessionProvider } from '../storeToken';

export default function RootLayout() {
    return (
        <SessionProvider>
            <Slot />
        </SessionProvider>
    );
}