import React, { useState, useEffect, useContext, createContext} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, 
	KeyboardAvoidingView, ScrollView, Platform, 
    Alert} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { socket } from '../../../webSocket';
import { getToken } from '../../../tokenHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

//this is for the friend list
// there should be a button at the top of the screen that says "Add Friend"


const Friends = () => {
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const { id } = useLocalSearchParams();
    const [friend, setFriend] = useState('');
    const [friendList, setFriendList] = useState([]);

    useEffect(() => {
        getToken().then((token) => {
            setToken(token);
        })
        .catch((error) => {
            console.error('Error getting token:', error);
        })
        .then(() => {
            fetchData();
        });
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const value = await AsyncStorage.getItem('friends');
            if (value !== null) {
                setFriendList(JSON.parse(value));
            } 
        } catch (error) {
            console.error('AsyncStorage error:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const addFriend = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://jaydenmoore.net/addFriend', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    userId: id,
                    friendUsername: friend,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                console.log('HTTP status 200');
                Alert.alert('Friend request sent');
            }

            const data = await response.json();
            console.log('Data:', data);
            setFriend('');
            fetchData();
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>
                    <View style={styles.container}>
                        <Text>Friends</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setFriend}
                            value={friend}
                            placeholder="Friend username"
                        />
                        <Text onPress={addFriend}>Add Friend</Text>
                        {error ? <Text>{error.toString()}</Text> : null}
                        {isLoading ? <Text>Loading...</Text> : null}
                        {friendList.map((friend) => (
                            <Text key={friend.friendId}>{friend.name}</Text>
                        ))}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 8,
        marginBottom: 8,
    },
});