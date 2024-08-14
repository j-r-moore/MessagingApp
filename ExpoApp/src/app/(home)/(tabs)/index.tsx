import React, { useEffect, useState, useContext } from 'react';
import { Text, View } from 'react-native';
//import the channelList component
import ChannelList from '../../../components/channelList';
import { socket } from '../../../webSocket';
import { useSession } from '../../../storeToken';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Home = () => {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const { signOut } = useSession();

    const getChannels = async () => {
        try {
            setLoading(true);
            const value = await AsyncStorage.getItem('channels');
            if (value !== null) {
                setData(JSON.parse(value));
            }
        } catch (error) {
            console.error('AsyncStorage error:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    const finaldata = [];
    

    for (let i = 0; i < data.length; i++) {
        finaldata.push(data[i]);
    }

    return (
        <View>
            <Text>Home</Text>
            <Text onPress={signOut}>Sign Out</Text>
            {error ? <Text>{error.toString()}</Text> : null}
            {isLoading ? <Text>Loading...</Text> : null}
            {finaldata.map((data) => (
                <ChannelList key={data.channelId} Id={data.channelId} name={data.name} />
            ))}
        </View>
    );
}

export default Home;