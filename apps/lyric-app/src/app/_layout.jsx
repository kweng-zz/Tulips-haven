// src/app/_layout.jsx
import { Tabs } from 'expo-router';
import { useColorScheme, Text } from 'react-native';

export default function Layout() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: isDarkMode ? '#121212' : '#6200ee',
                },
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
                },
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: isDarkMode ? '#888' : '#999',
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{
                    title: 'Lyrica',
                    tabBarLabel: 'Editor',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>✍️</Text>
                    ),
                }}
            />
            <Tabs.Screen 
                name="library" 
                options={{
                    title: 'My Library',
                    tabBarLabel: 'Library',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📚</Text>
                    ),
                }}
            />
        </Tabs>
    );
}