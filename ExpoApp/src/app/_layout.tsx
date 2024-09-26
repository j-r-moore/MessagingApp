// Define global providers

import { Slot } from 'expo-router' ;
import { SessionProvider } from '../storeToken';
import { SocketProvider } from '../context/SocketContext';


export default function RootLayout() {
    return (

        <SessionProvider>
            <SocketProvider>
                <Slot />
            </SocketProvider>
        </SessionProvider>
    );
}