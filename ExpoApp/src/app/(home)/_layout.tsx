import { Redirect, Stack } from "expo-router";
import React from 'react';

import { useSession } from '../../storeToken';

export default function Layout() {
    const { session } = useSession();
    
    if (!session) {
        return <Redirect href="/signIn" />;
    }

    return <Stack />;

}