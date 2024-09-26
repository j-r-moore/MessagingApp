
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useSession } from '../../storeToken'
import { socket } from '../../webSocket'
import { router } from 'expo-router'


export default function Auth() {
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)


  async function signInWithEmail() {
    setLoading(true)
    console.log('signInWithEmail', email, password)

    if (!email || !password) {
      Alert.alert('Please enter an email and password')
      setLoading(false)
      return
    }
    
    try {
      // Call the sign in API
      const response = await fetch('https://jaydenmoore.net/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, socketId: socket.id }),
      })
      .then((response) => {
        console.log('response:', response);
        if (response.ok) {
          return response.json();
        } else {
          Alert.alert('Error:', 'Invalid email or password');
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        Alert.alert('Error:', error)
      })

      if (response) {
        // Sign in the user
        console.log('token:', response.token)
        signIn(response.token)


        // Get the user info
        const userData = await getUserInfo(response.token);
        if (userData) {
          const userInfo = userData.userInformation;
          const channels = userData.channelsData;
          const friends = userData.friendsList;
          const pendingFriends = userData.pendingFriendsList;

          console.log('User info:', userInfo);
          console.log('Channels:', channels);
          console.log('Friends:', friends);
          console.log('Pending friends:', pendingFriends);

          try {
            if (userInfo) {
              await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
            }
            if (channels) {
              await AsyncStorage.setItem('channels', JSON.stringify(channels))
            }
            if (friends) {  
              await AsyncStorage.setItem('friends', JSON.stringify(friends))
            }
            if (pendingFriends) {
              await AsyncStorage.setItem('pendingFriends', JSON.stringify(pendingFriends))
            }
          } catch (error) {
            console.error('Error:', error)
            Alert.alert('Error:', error)
          }
          
        }


        router.push('/'); 
      }
    } catch (error) {
      console.error('Error:', error)
      Alert.alert('Error:', error)
    }

    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    console.log('signUpWithEmail', email, password)

    if (!name || !email || !password || !username) {
      Alert.alert('Please enter a name, email, and password and username')
      setLoading(false)
      return
    }

    try {
      // Call the sign up API
      const response = await fetch('https://jaydenmoore.net/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, username, socketId: socket.id }),
      })
      .then((response) => {
        console.log('response:', response);
        if (response.ok) {
          return response.json();
        } else {
          Alert.alert('Error:', 'Email may already be in use, or username may already be taken. Please try again with a different email or username.');
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        Alert.alert('Error:', error)
      })

      if (response) {
        // Sign in the user
        console.log('token:', response.token)
        signIn(response.token)

        // Get the user info
        const userData = await getUserInfo(response.token)
        if (userData) {
          const userInfo = userData.userInformation;
          const channels = userData.channels;
          const friends = userData.friendsList;
          const pendingFriends = userData.pendingFriendsList;

          console.log('User info:', userInfo);
          console.log('Channels:', channels);

          try {
            if (userInfo) {
              await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
            }
            if (channels) {
              await AsyncStorage.setItem('channels', JSON.stringify(channels))
            }
            if (friends) {  
              await AsyncStorage.setItem('friends', JSON.stringify(friends))
            }
            if (pendingFriends) {
              await AsyncStorage.setItem('pendingFriends', JSON.stringify(pendingFriends))
            }
          } catch (error) {
            console.error('Error:', error)
            Alert.alert('Error:', error)
          }
          
        }

        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error)
      Alert.alert('Error:', error)
    }

    
    setLoading(false)
  }

  //function to call the get user info API
  async function getUserInfo(tokenSet) {
    console.log('getUserInfo');
    console.log('token:', tokenSet);
    try {
      const response = await fetch('https://jaydenmoore.net/myData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + tokenSet,
        },
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          Alert.alert('Error:', 'Invalid token');
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        Alert.alert('Error:', error)
      })

      if (response) {
        console.log('User info:', response);
        const userData = response;
        return userData;
      }
    } catch (error) {
      console.error('Error:', error)
      Alert.alert('Error:', error)
    }
  }
      



  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Name"
          leftIcon={{ type: 'font-awesome', name: 'user' }}
          onChangeText={(text) => setName(text)}
          value={name}
          placeholder="Name (Sign up only)"
        />
        <Input
          label="Username"
          leftIcon={{ type: 'font-awesome', name: 'user' }}
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Username (Sign up only)"
        />
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})