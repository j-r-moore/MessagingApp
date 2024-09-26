import React, { useState, useEffect, useContext, createContext} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, 
	KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { socket } from '../../webSocket';
import { getToken } from '../../tokenHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Messages = () => {
	const [message, setMessage] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
	const { id } = useLocalSearchParams();
	const [token, setToken] = useState('');
	const [userId, setUserId] = useState('');
	const [isConnected, setIsConnected] = useState(socket.connected);

	useEffect(() => {
        getToken().then((tokenFromStorage) => {
            setToken(tokenFromStorage);
            return tokenFromStorage;
        })
        .then((tokenFromStorage) => {
            fetchData(tokenFromStorage);
        })
		.then(() => {
			console.log('Fetching user ID');
			try {
					AsyncStorage.getItem('userInfo')
					.then((value) => {
						const userInfo = JSON.parse(value);
						setUserId(userInfo.userId);
					});
				}
			catch (error) {
				console.error('AsyncStorage error:', error);
			}
		})
        .catch((error) => {
            console.error('Token error:', error);
        });
    }, []);
	

    const fetchData = async (token) => {
        try {
			console.log('Fetching data');
            setLoading(true);
            const response = await fetch('https://jaydenmoore.net/loadMessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    channelId: id,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
				console.log('HTTP status 200');
			}

            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

	const finaldata = [];

	for (let i = 0; i < data.length; i++) {
		finaldata.push(data[i]);
	}

	//logic for when the server emits a message event while the user is on the messages page
	useEffect(() => {
		console.log('useEffect triggered');
		console.log('Socket connection status:', isConnected);

		if (isConnected) {
			console.log('Socket id:', socket.id);
		}
	
		
	
		function onMessage(data) {
			console.log('Message received:', data);
			console.log('Name:', data.senderName);
			const name = data.senderName;
			const message = data.message;
			setData((prevData) => [...prevData, { name: name, message: message }]);
		}
	
		socket.on('message', onMessage);
	
		return () => {
			console.log('Cleaning up event listeners');
			socket.off('message', onMessage);
		};
	}, []);

	//logic for when the messages input is submitted
	const handleSubmit = () => {
		setLoading(true);
		fetch('https://jaydenmoore.net/message', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			body: JSON.stringify({
				channelId: id,
				userId: userId,
				message: message,
			}),
		})
		.then(async (response) => {
			setLoading(false);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			} else {
				console.log('HTTP status 200');
				const data = await response.json();
				const name = data.name;
				setData((prevData) => [...prevData, { name: name, message: message }]);
				setMessage('');
			}
		})
		.catch((error) => {
			setLoading(false);
			console.error('Fetch error:', error);
			setError(error);
		});

		
	}

    return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ScrollView contentContainerStyle={styles.inner}>
					<View>
						{error ? <Text>{error.toString()}</Text> : null}
						{isLoading ? <Text>Loading...</Text> : null}
						{finaldata.map((data, index) => (
							<Text key={index}>{data.name}: {data.message}</Text>
						))}
					</View>
					<TextInput
						style={styles.messageBox}
						placeholder="Enter a message"
						value={message}
						onChangeText={setMessage}
						onSubmitEditing={handleSubmit}
					/>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	inner: {
		padding: 30,
		flex: 1,
		justifyContent: 'flex-start',
	},
	messageBox: {
		borderWidth: 1,
		borderColor: 'black',
		padding: 10,
		marginTop: 10,
	},
});

export default Messages;