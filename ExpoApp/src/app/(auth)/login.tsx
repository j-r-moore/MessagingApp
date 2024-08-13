
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Button, Input } from 'react-native-elements'

import { useSession } from '../../storeToken'
import { socket } from '../../webSocket'
import { router } from 'expo-router'

export default function Auth() {
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  if (socket.disconnected) {
    // wait 10 seconds before assuming the connection is lost
    setTimeout(() => {
      if (socket.disconnected) {
        Alert.alert('Connection lost', 'Please check your internet connection')
      }
    }, 10000)
  }


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
        body: JSON.stringify({ email, password }),
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

    if (!name || !email || !password) {
      Alert.alert('Please enter a name, email, and password')
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
        body: JSON.stringify({ name, email, password }),
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
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error)
      Alert.alert('Error:', error)
    }

    
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Name"
          leftIcon={{ type: 'font-awesome', name: 'user' }}
          onChangeText={(text) => setName(text)}
          value={name}
          placeholder="Name"
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