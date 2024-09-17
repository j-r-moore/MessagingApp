import { Text, Button, View, StyleSheet, Pressable } from 'react-native';
import { useSession } from '../../../storeToken';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';



export default function MainTabScreen() {
    const { signOut } = useSession();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    AsyncStorage.getItem('userInfo')
        .then((value) => {
            const userInfo = JSON.parse(value);
            setName(userInfo.name);
            setUsername(userInfo.username);
        });
        
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome, {name}!</Text>
            <Text style={styles.text}>Username: {username}</Text>
            <Pressable style={styles.button} onPress={signOut}>
                <Text>Sign Out</Text>
                <FontAwesome5 name="sign-out-alt" size={24} color="black" paddingLeft={10} />
            </Pressable>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    
    button: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'lightgrey',
        //give the two icons some space between them

    },
});