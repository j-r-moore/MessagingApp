import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
//import the channelList component
import ChannelList from '../../../components/channelList';


const Home = () => {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await fetch('https://jaydenmoore.net/getUserInfo'); // Add 'https://' to the URL
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    const finaldata = [];
    useEffect(() => { //useEffect is a hook that runs after the first render
        fetchData();
    }, []);

    for (let i = 0; i < data.length; i++) {
        finaldata.push(data[i]);
    }

    return (
        <View>
            {error ? <Text>{error.toString()}</Text> : null}
            {isLoading ? <Text>Loading...</Text> : null}
            {finaldata.map((data) => (
                <ChannelList key={data.userId} Id={data.userId} name={data.name} />
            ))}
        </View>
    );
}

export default Home;