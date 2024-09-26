import React, { useState, useEffect, useContext, createContext} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, 
	KeyboardAvoidingView, ScrollView, Platform, 
    Alert, Modal,
    Button, Pressable } from 'react-native';
import { socket } from '../../../webSocket';
import { getToken } from '../../../tokenHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddFriendModal from '../../../components/addFriendModal';
import AcceptFriend from '../../../components/acceptFriend';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSocket } from '../../../context/SocketContext';


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
    const { friendRequests, friendRequestAccepted, newChannel } = useSocket();

    


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


    useEffect(() => {
        if (friendRequests.length > 0) {
            // for each friend request, check if it is already in the pending friend list
            for (let i = 0; i < friendRequests.length; i++) {
                // set the flag
                let friendExists = false;
                // loop through the pending friend list to see if friendRequest[i] is already in the list
                for (let j = 0; j < pendingFriendList.length; j++) {
                    if (pendingFriendList[j].userId === friendRequests[i].userId) {
                        friendExists = true;
                        console.log('Friend already exists');
                        break;
                    }
                }
                // completed the check to see if it already exists
                if (!friendExists) {
                    // add the friend to the pending friend list
                    console.log('Friend does not exist');
                    console.log('Friend request:', friendRequests[i]);
                    setPendingFriendList((prev) => [...prev, friendRequests[i]]);
                    console.log('Pending friend list:', pendingFriendList);
                    // save the pending friend list to AsyncStorage
                    AsyncStorage.setItem('pendingFriends', JSON.stringify([...pendingFriendList, friendRequests[i]]));
                }
             
            }
        }
    }, [friendRequests]);

    useEffect(() => {
        if (friendRequestAccepted.length > 0) {
            for (let i = 0; i < friendRequestAccepted.length; i++) {
                let friendExists = false;
                for (let j = 0; j < friendList.length; j++) {
                    if (friendList[j].userId === friendRequestAccepted[i].userId) {
                        friendExists = true;
                        break;
                    }
                }
                if (!friendExists) {
                    setFriendList((prev) => [...prev, friendRequestAccepted[i]]);
                    AsyncStorage.setItem('friends', JSON.stringify([...friendList, friendRequestAccepted[i]]));
                }
            }
        }
    }, [friendRequestAccepted]);


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

    const messageFriend = async (friend) => {
        try {
            console.log('Message friend:', friend);
            const response = await fetch('https://jaydenmoore.net/createChannel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    userId: id,
                    friendId: friend.userId,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data:', data);

            if (data.message === 'Channel already exists') {
                //open the channel
                console.log('Channel already exists');
                router.push({ pathname: '/messages', params: { id: data.channelId } });
            } else {
                //create the channel
                console.log('Channel created');
                AsyncStorage.getItem('channels').then((value) => {
                    const AsyncStorageData = JSON.parse(value);
                    AsyncStorageData.push(data);
                    AsyncStorage.setItem('channels', JSON.stringify(data));
                }
                )
                .catch((error) => {
                    console.error('AsyncStorage error:', error);
                });
                router.push({ pathname: '/messages', params: { id: data.channelId } });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error);
        }
    }
    


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>

                <View style={styles.addAndAcceptButtons}>
                        <AddFriendModal
                            modalVisible={modalVisible}
                            setModalVisible={setModalVisible}
                            addFriend={addFriend}
                            token={token}
                            id={id}
                        />
                        <Pressable style={styles.addFriendButton} onPress={() => setModalVisible(true)}>
                            <Text>Add Friends</Text>
                            <FontAwesome5 name="user-plus" size={24} color="black" paddingLeft={8} />
                        </Pressable>
                        <AcceptFriend
                            modalVisible={acceptModalVisible}
                            setModalVisible={setAcceptModalVisible}
                            acceptFriend={acceptFriend}
                            token={token}
                            id={id}
                            pendingFriendList={pendingFriendList}
                        />
                        <Pressable style={styles.acceptFriendButton} onPress={() => setAcceptModalVisible(true)}>
                            <Text>Accept Friends</Text>
                            <FontAwesome5 name="user-check" size={24} color="black" paddingLeft={8} />
                        </Pressable>
                    </View>

                    <View style={styles.container}>
                        {error ? <Text>{error.toString()}</Text> : null}
                        {isLoading ? <Text>Loading...</Text> : null}
                        {friendList.map((friend) => (
                            <View key={friend.userId} style={styles.friendContainer}>
                                <Text style={styles.friendText}>{friend.name}</Text>
                                <Button
                                    title="Message"
                                    onPress={() => {
                                        messageFriend(friend);
                                    }}
                                />
                            </View>
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
    friendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        padding: 8,
    },
    friendText: {
        fontSize: 16,
    },
    addAndAcceptButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addFriendButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
        
    },
    acceptFriendButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
                
    },
});

export default Friends;