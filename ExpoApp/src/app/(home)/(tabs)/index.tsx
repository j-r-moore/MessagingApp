import React, { useEffect, useState, useContext } from 'react';
import { Text, View } from 'react-native';
//import the channelList component
import ChannelList from '../../../components/channelList';
import { socket } from '../../../webSocket';


const Home = () => {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(socket.connected) {
            fetchData();
        } else {
            socket.on('connect', () => {
                fetchData();
            });
        }
    }
    , []);


    const fetchData = async () => {
        try {
            setLoading(true);
            const userId = 1;
            socket.emit('getUserInfo', userId);
            socket.on('userInfo', (user, channels) => {
                console.log('User info:', user);
                console.log('Channels:', channels);
                setData(channels);
            });
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }
    const finaldata = [];
    

    for (let i = 0; i < data.length; i++) {
        finaldata.push(data[i]);
    }

    return (
        <View>
            {error ? <Text>{error.toString()}</Text> : null}
            {isLoading ? <Text>Loading...</Text> : null}
            {finaldata.map((data) => (
                <ChannelList key={data.channelId} Id={data.channelId} name={data.name} />
            ))}
        </View>
    );
}

export default Home;