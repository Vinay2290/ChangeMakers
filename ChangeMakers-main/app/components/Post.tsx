import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Share, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { Post as PostType } from '../types';

const { width } = Dimensions.get('window');

interface Comment {
    id: string;
    username: string;
    text: string;
    timestamp: string;
}

interface PostProps extends Omit<PostType, 'id'> { }

export default function Post({ title, description, location, category, mediaItems, username, timestamp }: PostProps) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            username: 'John Doe',
            text: 'Great initiative! Keep up the good work.',
            timestamp: '2 hours ago'
        },
        {
            id: '2',
            username: 'Jane Smith',
            text: 'I would love to join this project!',
            timestamp: '1 hour ago'
        }
    ]);
    const videoRef = useRef<Video>(null);

    const handleVideoPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded && status.didJustFinish) {
            // Loop to the next media item when video finishes
            setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleComment = () => {
        setShowComments(!showComments);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${title}\n${description}\n\nShared via Changemakers`,
                title: title
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                username: 'Current User', // Replace with actual user
                text: newComment.trim(),
                timestamp: 'Just now'
            };
            setComments(prev => [comment, ...prev]);
            setNewComment('');
        }
    };

    const renderMedia = () => {
        const currentMedia = mediaItems[currentMediaIndex];

        if (currentMedia.type === 'video') {
            return (
                <Video
                    ref={videoRef}
                    source={{ uri: currentMedia.uri }}
                    style={styles.media}
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    shouldPlay={true}
                    onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate}
                />
            );
        }

        return (
            <Image
                source={{ uri: currentMedia.uri }}
                style={styles.media}
                resizeMode="contain"
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{username}</Text>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                </View>
                <TouchableOpacity>
                    <MaterialIcons name="more-vert" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.mediaContainer}>
                {renderMedia()}
                {mediaItems.length > 1 && (
                    <View style={styles.mediaIndicator}>
                        {mediaItems.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicatorDot,
                                    index === currentMediaIndex && styles.activeIndicatorDot
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.metadata}>
                    <Text style={styles.location}>{location}</Text>
                    <Text style={styles.category}>{category}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleLike}
                    >
                        <MaterialIcons
                            name={isLiked ? "favorite" : "favorite-border"}
                            size={24}
                            color={isLiked ? "#FF3B30" : "#666"}
                        />
                        <Text style={[styles.actionText, isLiked && styles.likedText]}>
                            {likes} {likes === 1 ? 'Like' : 'Likes'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleComment}
                    >
                        <MaterialIcons
                            name={showComments ? "chat-bubble" : "chat-bubble-outline"}
                            size={24}
                            color={showComments ? "#007AFF" : "#666"}
                        />
                        <Text style={[styles.actionText, showComments && styles.activeText]}>
                            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShare}
                    >
                        <MaterialIcons name="share" size={24} color="#666" />
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Comments Section */}
                {showComments && (
                    <View style={styles.commentsSection}>
                        <ScrollView style={styles.commentsList}>
                            {comments.map(comment => (
                                <View key={comment.id} style={styles.commentItem}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentUsername}>{comment.username}</Text>
                                        <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                                    </View>
                                    <Text style={styles.commentText}>{comment.text}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.commentInputContainer}
                        >
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                                onPress={handleAddComment}
                                disabled={!newComment.trim()}
                            >
                                <MaterialIcons
                                    name="send"
                                    size={24}
                                    color={newComment.trim() ? "#007AFF" : "#999"}
                                />
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    mediaContainer: {
        width: width,
        height: width,
        position: 'relative',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    mediaIndicator: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeIndicatorDot: {
        backgroundColor: '#fff',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    metadata: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    location: {
        fontSize: 12,
        color: '#666',
        marginRight: 8,
    },
    category: {
        fontSize: 12,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    likedText: {
        color: '#FF3B30',
    },
    commentsSection: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    commentsList: {
        maxHeight: 300,
    },
    commentItem: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentTimestamp: {
        fontSize: 12,
        color: '#666',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    commentInput: {
        flex: 1,
        marginRight: 8,
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        maxHeight: 100,
    },
    sendButton: {
        padding: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    activeText: {
        color: '#007AFF',
    },
}); 