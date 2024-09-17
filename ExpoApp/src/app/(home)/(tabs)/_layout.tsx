import React from 'react';
import { Tabs } from "expo-router";
import { FontAwesome5 } from '@expo/vector-icons';


export default function TabsNavigator() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ size, color }) => <FontAwesome5 name="comment" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Friends',
                    tabBarIcon: ({ size, color }) => <FontAwesome5 name="users" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ size, color }) => <FontAwesome5 name="user-alt" size={size} color={color} />,
                }} />
        </Tabs>
    );
}


