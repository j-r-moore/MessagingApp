import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const messages = [
	{ id: '1', text: 'Hello, how are you?' },
	{ id: '2', text: 'Are you coming to the party?' },
	{ id: '3', text: 'Don’t forget the meeting tomorrow.' },
	// Add more messages as needed
];

const Messages = () => {
	const renderItem = ({ item }) => (
		<View style={styles.messageContainer}>
			<Text style={styles.messageText}>{item.text}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={messages}
				renderItem={renderItem}
				keyExtractor={item => item.id}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	messageContainer: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
	messageText: {
		fontSize: 16,
	},
});

export default Messages;