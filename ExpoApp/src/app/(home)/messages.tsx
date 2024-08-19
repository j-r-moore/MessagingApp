import React, { useState, useEffect, useContext, createContext} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, 
	KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { socket } from '../../webSocket';
import { getToken } from '../../tokenHandler';


const Messages = () => {
	const [message, setMessage] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
	const { id } = useLocalSearchParams();
	const [token, setToken] = useState('');

	useEffect(() => {
		getToken().then((token) => {
			setToken(token);
		}
		)
		.catch((error) => {
			console.error('Error getting token:', error);
		}
		)
		.then(() => {
			fetchData();
		}
		);
	});
	
	

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://jaydenmoore.net/loadMessages', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
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
		console.log(data[i]);
		finaldata.push(data[i]);
	}

	//logic for when the server emits a message event while the user is on the messages page
	useEffect(() => {
		if (socket.connected) {
			console.log('Socket connected');
			socket.on('message', (message) => {
				console.log('Message received:', message);
				setData((prevData) => [...prevData, message]); // Add the new message to the data array
			}
		);
		}
	}
	, []);

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
				userId: 1,
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