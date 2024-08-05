import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, 
	KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebSocketContext } from '../../webSocket';


const Messages = () => {
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
	const { id } = useLocalSearchParams();
	const ws = useContext(WebSocketContext);
	

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://jaydenmoore.net/loadMessages', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
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

    useEffect(() => {
        fetchData();
    }, []);

	for (let i = 0; i < data.length; i++) {
		finaldata.push(data[i]);
	}

	//logic for when the server emits a message event while the user is on the messages page
	useEffect(() => {
		if (ws) {
			ws.on('message', (message) => {
				console.log('Message received:', message);
				setData((prevData) => [...prevData, message]); // Add the new message to the data array
			}
		);
		}
	}
	, [ws]);

	//logic for when the messages input is submitted
	const handleSubmit = (e) => {
		const message = e.nativeEvent.text;
		fetch('https://jaydenmoore.net/message', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				channelId: id,
				userId: 1,
				message: message,
			}),
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			} else {
				console.log('HTTP status 200');
			}
		})
		.catch((error) => {
			console.error('Fetch error:', error);
			setError(error);
		})
		// Add the new message to the data array
		.then(() => {
			setData((prevData) => [...prevData, { userId: 1, message: message }]);
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
							<Text key={index}>{data.userId}: {data.message}</Text>
						))}
					</View>
					<TextInput
						placeholder="Enter a message"
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
		padding: 24,
		flex: 1,
		justifyContent: 'center',
	},
	messageText: {
		fontSize: 16,
	},
});

export default Messages;