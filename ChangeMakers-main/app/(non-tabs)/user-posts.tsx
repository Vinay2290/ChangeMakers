import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { postService } from '../lib/post-service';
import { Post } from '../lib/models';

export default function UserPostsScreen() {
    const { userId } = useLocalSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, [userId]);

    const loadPosts = async () => {
        try {
            const response = await postService.getPosts(100, 0, { authorId: userId as string });
            setPosts(response.documents.map(doc => ({
                postId: doc.postId,
                title: doc.title,
                description: doc.description,
                location: doc.location || '',
                likes: doc.likes || 0,
                comments: doc.comments || 0,
                postedAt: new Date(doc.postedAt),
                authorName: doc.authorName,
                authorId: doc.authorId
            })));
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderPost = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={styles.postCard}
            onPress={() => router.push(`/post/${item.postId}`)}
        >
            <View style={styles.postContent}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                <Text style={styles.postLocation}>{item.location}</Text>
                <View style={styles.postStats}>
                    <Text style={styles.statText}>{item.likes} likes</Text>
                    <Text style={styles.statText}>{item.comments} comments</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.postId}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No posts found</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 16,
    },
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postContent: {
        padding: 16,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    postDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    postLocation: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    postStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statText: {
        fontSize: 12,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
}); 