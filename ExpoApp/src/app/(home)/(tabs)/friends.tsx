import React, { useState, useEffect, useContext, createContext} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, 
	KeyboardAvoidingView, ScrollView, Platform, 
    Alert, Modal} from 'react-native';
import { socket } from '../../../webSocket';
import { getToken } from '../../../tokenHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddFriendModal from '../../../components/addFriendModal';
import AcceptFriend from '../../../components/acceptFriend';

//this is for the friend list
// there should be a button at the top of the screen that says "Add Friend"


const Friends = () => {
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [id, setId] = useState('');
    const [friend, setFriend] = useState('');
    const [friendList, setFriendList] = useState([]);
    const [pendingFriendList, setPendingFriendList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [acceptModalVisible, setAcceptModalVisible] = useState(false);
    


    useEffect(() => {
        AsyncStorage.getItem('userInfo').then((value) => {
            const data = JSON.parse(value);
            setId(data.userId);
        })
        .catch((error) => {
            console.error('AsyncStorage error:', error);
        });
        AsyncStorage.getItem('pendingFriends').then((value) => {
            const data = JSON.parse(value);
            setPendingFriendList(data);
        })
        .catch((error) => {
            console.error('AsyncStorage error:', error);
        });
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
                console.log('Friend list:', JSON.parse(value));
                setFriendList(JSON.parse(value));
            } else {
                console.log('No friends');
            }
        } catch (error) {
            console.error('AsyncStorage error:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const addFriend = async (token, id, friend) => {
        try {
            console.log(token);
            console.log(id);
            console.log(friend);
            setLoading(true);
            const response = await fetch('https://jaydenmoore.net/addFriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    userId: id,
                    friendUsername: friend,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.message === 'Friend not found') {
                    Alert.alert('Error:', 'Friend not found');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                if (data.message === 'Friend not found') {
                    Alert.alert('Error:', 'Friend not found');
                    setError('Error: Friend not found');
                } else {
                    Alert.alert('Friend request sent');
                }
            }

            const data = await response.json();
            console.log('Data:', data);
            if (data.message === 'Friend not found') {
                Alert.alert('Error:', 'Friend not found');
                setError('Error: Friend not found');
            }
            setFriend('');
            fetchData();
        } catch (error) {
            console.error('Fetch error:', error);
            // setError(error);
        } finally {
            setLoading(false);
        }
    }

    const acceptFriend = async (token, id, friendId) => {
        try {
            setLoading(true);
            const response = await fetch('https://jaydenmoore.net/acceptFriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    userId: id,
                    friendId: friendId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data:', data);
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
                        <AddFriendModal
                            modalVisible={modalVisible}
                            setModalVisible={setModalVisible}
                            addFriend={addFriend}
                            token={token}
                            id={id}
                        />
                        <Text 
                            style={{ fontSize: 20, fontWeight: 'bold' }}
                            
                            onPress={() => {
                                setModalVisible(true);
                            }}
                        >
                            Add Friend
                        </Text>
                        <AcceptFriend
                            modalVisible={acceptModalVisible}
                            setModalVisible={setAcceptModalVisible}
                            acceptFriend={acceptFriend}
                            token={token}
                            id={id}
                            pendingFriendList={pendingFriendList}
                        />
                        <Text 
                            style={{ fontSize: 20, fontWeight: 'bold' }}
                            onPress={() => {
                                setAcceptModalVisible(true);
                            }}
                        >
                            Accept Friend Requests
                        </Text>
                        {error ? <Text>{error.toString()}</Text> : null}
                        {isLoading ? <Text>Loading...</Text> : null}
                        {friendList.map((friend) => (
                            <Text key={friend.userId}>{friend.name}</Text>
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

export default Friends;