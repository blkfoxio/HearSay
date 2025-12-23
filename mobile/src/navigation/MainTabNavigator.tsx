/**
 * Main tab navigation for authenticated users.
 *
 * Tabs: Home, Lessons, Phrasebook, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import LessonsNavigator from './LessonsNavigator';
import PhrasebookScreen from '../screens/phrasebook/PhrasebookScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Today',
          tabBarLabel: 'Today',
          // TODO: Add icons in Phase 1
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonsNavigator}
        options={{
          title: 'Lessons',
          tabBarLabel: 'Lessons',
          headerShown: false, // LessonsNavigator handles its own header
        }}
      />
      <Tab.Screen
        name="Phrasebook"
        component={PhrasebookScreen}
        options={{
          title: 'Phrasebook',
          tabBarLabel: 'Phrases',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
