import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Post {
    id: string;
    title: string;
    content: string;
    likes: number;
    comments: number;
    createdAt: string;
}

// Dummy data - in a real app, this would come from an API
const USER_POSTS: Post[] = [
    {
        id: '1',
        title: 'Our Latest Cleanup Drive',
        content: 'We successfully cleaned up 5 tons of waste from the local beach. Thanks to all the volunteers who made this possible! The community response was overwhelming, and we\'re planning our next cleanup for next month.',
        likes: 45,
        comments: 12,
        createdAt: '2024-03-15'
    },
    {
        id: '2',
        title: 'Tree Planting Success',
        content: 'Thanks to all volunteers who helped us plant 1000 trees in the urban area. This initiative will help improve air quality and provide shade for the community. We\'re already seeing positive changes in the local ecosystem.',
        likes: 78,
        comments: 23,
        createdAt: '2024-02-28'
    },
    {
        id: '3',
        title: 'Community Garden Update',
        content: 'Our community garden is thriving! We\'ve harvested our first batch of vegetables and distributed them to local food banks. The garden has become a hub for community learning and sustainable practices.',
        likes: 92,
        comments: 15,
        createdAt: '2024-02-15'
    },
    {
        id: '4',
        title: 'Recycling Workshop Success',
        content: 'Our recycling workshop was a great success! Over 50 community members learned about proper waste segregation and recycling techniques. We\'re planning more educational sessions in the coming weeks.',
        likes: 34,
        comments: 8,
        createdAt: '2024-01-30'
    }
];

const PostItem = ({ post }: { post: Post }) => (
    <View style={styles.postItem}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.postMeta}>
            <View style={styles.postStat}>
                <MaterialIcons name="thumb-up" size={16} color="#666" />
                <Text style={styles.postStatText}>{post.likes}</Text>
            </View>
            <View style={styles.postStat}>
                <MaterialIcons name="chat" size={16} color="#666" />
                <Text style={styles.postStatText}>{post.comments}</Text>
            </View>
            <Text style={styles.postDate}>{post.createdAt}</Text>
        </View>
    </View>
);

export default function UserPostsScreen() {
    const { id } = useLocalSearchParams();

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'My Posts',
                    headerBackTitle: 'Back'
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={USER_POSTS}
                    renderItem={({ item }) => <PostItem post={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        padding: 16,
    },
    postItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    postContent: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    postStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postStatText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    postDate: {
        fontSize: 12,
        color: '#999',
    },
}); 