import { Modal, View, Text, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

const AcceptFriend = ({ modalVisible, setModalVisible, acceptFriend, token, id, pendingFriendList }) => {
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
                    <Text style={{ fontSize: 20, fontWeight: 'bold', }}>Accept Friend Requests</Text>
                    {pendingFriendList.map((pendingFriend) => (
                        <View key={pendingFriend.userId} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottomWidth: 1, borderBottomColor: 'black', padding: 8 }}>
                            <Text>{pendingFriend.name}</Text>
                            <Button
                                title="Accept"
                                onPress={() => {
                                    console.log('Accept friend:', pendingFriend);
                                    acceptFriend(token, id, pendingFriend.userId);
                                    setModalVisible(!modalVisible);
                                }}
                            />
                        </View>
                    ))}
                    <Button
                        title="Close"
                        onPress={() => {
                            setModalVisible(!modalVisible);
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}

export default AcceptFriend;    