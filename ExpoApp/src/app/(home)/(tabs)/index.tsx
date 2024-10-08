import React, { useEffect, useState, useContext } from 'react';
import { Text, View } from 'react-native';
//import the channelList component
import ChannelList from '../../../components/channelList';
import { socket } from '../../../webSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../../../context/SocketContext';


const Home = () => {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
	const [isConnected, setIsConnected] = useState(socket.connected);
    const { friendRequests, friendRequestAccepted, newChannel } = useSocket();

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

    useEffect(() => {
        getChannels();


        if (!isConnected) {
            socket.connect();
        } else {
            console.log('Socket already connected');
            console.log('Socket ID:', socket.id);
        }


    }, []);

    useEffect(() => {
        if (newChannel.length > 0) {
            for (let i = 0; i < newChannel.length; i++) {
                let channelExists = false;
                for (let j = 0; j < data.length; j++) {
                    if (newChannel[i].channelId === data[j].channelId) {
                        channelExists = true;
                        break;
                    }
                }
                if (!channelExists) {
                    setData((prev) => [...prev, newChannel[i]]);
                    AsyncStorage.setItem('channels', JSON.stringify([...data, newChannel[i]]));
                }
            }
        }
    }, [newChannel]);
                    
    
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