import { ID, Query } from 'appwrite';
import { appwriteConfig, databases } from './appwrite';
import { Post, PostComment, PostLike } from './models';

export const postService = {
    // Create a new post
    async createPost(
        userId: string,
        authorName: string,
        title: string,
        description: string,
        location: string,
        media: string[] = [],
        projectId?: string
    ) {
        try {
            const now = new Date().toISOString();

            const newPost = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                ID.unique(),
                {
                    title,
                    description,
                    media,
                    postId: ID.unique(),
                    location,
                    projectId,
                    likes: 0,
                    comments: 0,
                    postedAt: now,
                    updatedAt: now,
                    authorName,
                    authorId: userId
                }
            );

            return newPost;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    // Get a post by ID
    async getPost(postId: string) {
        try {
            const post = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                postId
            );

            return post;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    },

    // Get posts with pagination
    async getPosts(limit = 10, offset = 0, filters?: {
        authorId?: string;
        projectId?: string;
    }) {
        try {
            let queries = [
                Query.orderDesc('postedAt'),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (filters?.authorId) {
                queries.push(Query.equal('authorId', filters.authorId));
            }

            if (filters?.projectId) {
                queries.push(Query.equal('projectId', filters.projectId));
            }

            const posts = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                queries
            );

            return posts;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    },

    // Update a post
    async updatePost(postId: string, data: Partial<Post>) {
        try {
            const now = new Date().toISOString();

            const updatedPost = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                postId,
                {
                    ...data,
                    updatedAt: now
                }
            );

            return updatedPost;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    },

    // Delete a post
    async deletePost(postId: string) {
        try {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                postId
            );

            return { success: true };
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    },

    // Like a post
    async likePost(postId: string, userId: string) {
        try {
            const now = new Date().toISOString();

            // Check if already liked
            const existingLikes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.postLikeCollectionId, // You'll need to create this collection
                [
                    Query.equal('postId', postId),
                    Query.equal('userId', userId)
                ]
            );

            if (existingLikes.documents.length > 0) {
                return { success: false, message: 'Already liked' };
            }

            // Create like record
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postLikeCollectionId,
                ID.unique(),
                {
                    postId,
                    userId,
                    createdAt: now
                }
            );

            // Increment post likes count
            const post = await this.getPost(postId);
            await this.updatePost(postId, { likes: (post.likes || 0) + 1 });

            return { success: true };
        } catch (error) {
            console.error('Error liking post:', error);
            throw error;
        }
    },

    // Comment on a post
    async commentOnPost(postId: string, userId: string, comment: string) {
        try {
            const now = new Date().toISOString();

            // Create comment
            const newComment = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCommentCollectionId,
                ID.unique(),
                {
                    postId,
                    userId,
                    comment,
                    likes: 0,
                    createdAt: now,
                    updatedAt: now
                }
            );

            // Increment post comments count
            const post = await this.getPost(postId);
            await this.updatePost(postId, { comments: (post.comments || 0) + 1 });

            return newComment;
        } catch (error) {
            console.error('Error commenting on post:', error);
            throw error;
        }
    },

    // Like a comment
    async likeComment(commentId: string) {
        try {
            // Get current comment
            const comment = await databases.getDocument(
                appwriteConfig.databaseId,
                'postComments',
                commentId
            );

            // Increment likes
            const updatedComment = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCommentCollectionId,
                commentId,
                {
                    likes: (comment.likes || 0) + 1
                }
            );

            return updatedComment;
        } catch (error) {
            console.error('Error liking comment:', error);
            throw error;
        }
    },

    // Update a comment
    async updateComment(commentId: string, comment: string) {
        try {
            const now = new Date().toISOString();

            const updatedComment = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCommentCollectionId,
                commentId,
                {
                    comment,
                    updatedAt: now
                }
            );

            return updatedComment;
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        }
    },

    // Delete a comment
    async deleteComment(commentId: string, postId: string) {
        try {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCommentCollectionId,
                commentId
            );

            // Decrement post comments count
            const post = await this.getPost(postId);
            await this.updatePost(postId, {
                comments: Math.max(0, (post.comments || 0) - 1)
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // Get comments for a post
    async getPostComments(postId: string, limit = 10, offset = 0) {
        try {
            const comments = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.postCommentCollectionId,
                [
                    Query.equal('postId', postId),
                    Query.orderDesc('createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return comments;
        } catch (error) {
            console.error('Error fetching post comments:', error);
            throw error;
        }
    },

    // Get post likes
    async getPostLikes(userId: string) {
        try {
            const likes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.postLikeCollectionId,
                [
                    Query.equal('userId', userId)
                ]
            );

            return likes;
        } catch (error) {
            console.error('Error fetching post likes:', error);
            throw error;
        }
    },

    // Unlike a post
    async unlikePost(postId: string, userId: string) {
        try {
            // Find the like document
            const existingLikes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.postLikeCollectionId,
                [
                    Query.equal('postId', postId),
                    Query.equal('userId', userId)
                ]
            );

            if (existingLikes.documents.length === 0) {
                return { success: false, message: 'Not liked' };
            }

            // Delete the like document
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postLikeCollectionId,
                existingLikes.documents[0].$id
            );

            // Decrement post likes count
            const post = await this.getPost(postId);
            await this.updatePost(postId, { likes: Math.max(0, (post.likes || 0) - 1) });

            return { success: true };
        } catch (error) {
            console.error('Error unliking post:', error);
            throw error;
        }
    }
}; 