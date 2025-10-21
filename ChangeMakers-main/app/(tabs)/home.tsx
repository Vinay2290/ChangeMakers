import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { Post } from '../lib/models';
import { postService } from '../lib/post-service';
import { useAuth } from '../context/auth-context';

const COLORS = {
  primary: '#007AFF',
  gray: {
    light: '#f8f9fa',
    medium: '#6c757d',
    dark: '#343a40'
  },
  white: '#FFFFFF'
};

export default function HomeScreen() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        loadPosts();
        loadLikedPosts();
      }
    }
  }, [isAuthenticated, authLoading]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts(100, 0);
      const mappedPosts = response.documents.map(doc => ({
        postId: doc.$id,
        title: doc.title,
        description: doc.description,
        location: doc.location || '',
        likes: doc.likes || 0,
        comments: doc.comments || 0,
        postedAt: new Date(doc.postedAt),
        authorName: doc.authorName,
        authorId: doc.authorId,
        media: doc.media || []
      }));
      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadLikedPosts = async () => {
    if (!user) return;
    try {
      const likes = await postService.getPostLikes(user.$id);
      const likedPostIds = new Set(likes.documents.map((like: unknown) => (like as { postId: string }).postId));
      setLikedPosts(likedPostIds);
    } catch (error) {
      console.error('Error loading liked posts:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      if (likedPosts.has(postId)) {
        await postService.unlikePost(postId, user.$id);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await postService.likePost(postId, user.$id);
        setLikedPosts(prev => new Set(prev).add(postId));
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async (post: Post) => {
    setSelectedPost(post);
    setShowComments(true);
    try {
      const response = await postService.getPostComments(post.postId);
      setComments(response.documents);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;
    try {
      await postService.commentOnPost(selectedPost.postId, user.$id, newComment.trim());
      const response = await postService.getPostComments(selectedPost.postId);
      setComments(response.documents);
      setNewComment('');
      setPosts(prev => prev.map(p =>
        p.postId === selectedPost.postId ? { ...p, comments: p.comments + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderMedia = (media: string[] | undefined) => {
    if (!media || media.length === 0) return null;
    return media.map((url, index) => {
      const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
      const isVideo = url.match(/\.(mp4|mov|avi)$/i);

      if (isImage) {
        return (
          <Image
            key={index}
            source={{ uri: url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
          />
        );
      } else if (isVideo) {
        return (
          <Video
            key={index}
            source={{ uri: url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
          />
        );
      }
      return null;
    });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.authorName}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={COLORS.gray.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription}>{item.description}</Text>
        {renderMedia(item.media)}
      </View>

      <View style={styles.postFooter}>
        <View style={styles.stats}>
          <TouchableOpacity
            style={styles.statButton}
            onPress={() => handleLike(item.postId)}
          >
            <MaterialIcons
              name={likedPosts.has(item.postId) ? "favorite" : "favorite-border"}
              size={20}
              color={likedPosts.has(item.postId) ? "#FF3B30" : COLORS.gray.dark}
            />
            <Text style={[styles.statText, likedPosts.has(item.postId) && styles.likedText]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statButton}
            onPress={() => handleComment(item)}
          >
            <MaterialIcons name="chat" size={20} color={COLORS.gray.dark} />
            <Text style={styles.statText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.postedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPosts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Home',
          headerShown: true,
        }}
      />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.postId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts found</Text>
        }
      />

      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.gray.dark} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>{item.user?.name || 'Anonymous'}</Text>
                    <Text style={styles.commentTimestamp}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{item.comment}</Text>
                </View>
              )}
              keyExtractor={item => item.$id}
              contentContainerStyle={styles.commentsList}
            />

            <View style={styles.commentInputContainer}>
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
                <MaterialIcons name="send" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.gray.dark,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray.dark,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.gray.medium,
  },
  postContent: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray.dark,
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 16,
    color: COLORS.gray.dark,
    marginBottom: 12,
  },
  mediaContainer: {
    marginTop: 12,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.light,
    paddingTop: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: COLORS.gray.dark,
  },
  likedText: {
    color: '#FF3B30',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray.medium,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray.medium,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray.dark,
  },
  commentsList: {
    padding: 16,
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
    color: COLORS.gray.medium,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.gray.dark,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.light,
  },
  commentInput: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    backgroundColor: COLORS.gray.light,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 