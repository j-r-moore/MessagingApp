import { Text, View, Button, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";


export default function ChannelList({ Id, name }) {
    return (
        <View style={styles.container}>
            {/* box for each channel */}

            <Link
                href={{ 
                    pathname: '/messages',
                    params: { id: Id }
                }}>
                <Text style={styles.messageText}>{name}</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    messageText: {
        fontSize: 16,
    },
});