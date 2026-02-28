import { Tabs } from 'expo-router';
import { Layout, Clock, Plus } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#AAA',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 60,
                    right: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#FFF',
                    borderWidth: 1,
                    borderColor: '#EEE',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarIcon: ({ color }) => <Layout size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="pending"
                options={{
                    tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="capture"
                options={{
                    tabBarIcon: ({ color }) => (
                        <Plus size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
