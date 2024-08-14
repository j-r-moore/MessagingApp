import { useContext, createContext, type PropsWithChildren, useState } from 'react';
import { storeToken, getToken, deleteToken } from './tokenHandler';
import { Alert } from 'react-native';


const AuthContext = createContext<{ // sign in and out context
    signIn: (token: string) => void;
    signOut: () => void;
    session: string | null;
    isLoading: boolean;
}>({
    signIn: () => {},
    signOut: () => {},
    session: null,
    isLoading: false,
});



export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
          throw new Error('useSession must be wrapped in a <SessionProvider />'); 
        }
      }
    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[session, isLoading], setSession] = useState<[string | null, boolean]>([null, true]);
    
    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                signIn: async (token: string) => {
                    setSession([token, false]);
                    console.log('Signing in with token:', token);
                    Alert.alert('You have been signed in');
                    await storeToken(token);
                },
                signOut: async () => {
                    console.log('Signing out');
                    Alert.alert('You have been signed out');
                    await deleteToken();
                    setSession([null, false]);
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
    

