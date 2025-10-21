import React from 'react';
import { Stack } from 'expo-router';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#000',
            }}
          />
          <Stack.Screen
            name="project-details"
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#000',
            }}
          />
          <Stack.Screen
            name="create-project"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
              gestureEnabled: true,
            }}
          />
        </Stack>
      </UserProvider>
    </AuthProvider>
  );
}
