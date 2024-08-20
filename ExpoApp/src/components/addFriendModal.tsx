import { Modal, View, Text, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

const AddFriendModal = ({ modalVisible, setModalVisible, addFriend, token, id }) => {
    const [friend, setFriend] = useState('');

    //on press of the add button, the addFriend function is called
    //the addFriend function is passed down from the parent component



    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                }}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        padding: 20,
                        borderRadius: 10,
                        width: '80%',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', }}>Add Friend</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: 'black',
                            width: '80%',
                            padding: 10,
                            margin: 10,
                        }}
                        placeholder="Enter friend's username"
                        placeholderTextColor={'#888'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={(text) => setFriend(text)}
                        value={friend}
                    />
                    <Button
                        title="Add"
                        onPress={() => {
                            console.log('Add friend:', friend);
                            addFriend(token, id, friend);
                            setModalVisible(!modalVisible);
                        }}
                    />
                    <Button
                        title="Cancel"
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default AddFriendModal;