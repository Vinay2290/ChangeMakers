import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Header() {
    const handleNotifications = () => {
        router.push('/notifications');
    };

    return (
        <View style={styles.header}>
            <Text style={styles.title}>Home</Text>
            <View style={styles.rightSection}>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={handleNotifications}
                >
                    <MaterialIcons name="notifications" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 48, // Add padding for status bar
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        padding: 8,
    },
}); 