import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Notification {
    id: string;
    type: 'project' | 'post' | 'donation' | 'volunteer';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// Dummy notifications data
const NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'project',
        title: 'New Project Created',
        message: 'Your project "Environmental Cleanup" has been created successfully.',
        timestamp: '2 hours ago',
        read: false
    },
    {
        id: '2',
        type: 'donation',
        title: 'New Donation',
        message: 'John Doe donated $100 to your project.',
        timestamp: '5 hours ago',
        read: true
    },
    {
        id: '3',
        type: 'volunteer',
        title: 'New Volunteer',
        message: 'Jane Smith joined your project as a volunteer.',
        timestamp: '1 day ago',
        read: true
    },
    {
        id: '4',
        type: 'post',
        title: 'New Comment',
        message: 'Mike Johnson commented on your post.',
        timestamp: '2 days ago',
        read: false
    }
];

export default function NotificationsScreen() {
    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.unreadNotification]}
            onPress={() => {
                // Handle notification press
                console.log('Notification pressed:', item.id);
            }}
        >
            <View style={styles.notificationIcon}>
                <MaterialIcons
                    name={
                        item.type === 'project' ? 'folder' :
                            item.type === 'donation' ? 'attach-money' :
                                item.type === 'volunteer' ? 'people' :
                                    'comment'
                    }
                    size={24}
                    color={item.read ? '#666' : '#007AFF'}
                />
            </View>
            <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                    {item.title}
                </Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>{item.timestamp}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <FlatList
                data={NOTIFICATIONS}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
    },
    listContent: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    unreadNotification: {
        backgroundColor: '#f0f8ff',
        borderColor: '#007AFF',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    unreadText: {
        color: '#007AFF',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
}); 