import { ID, Query, Storage } from 'react-native-appwrite';
import { appwriteConfig, account, databases, client, storage } from './appwrite';

// User profile management
export const userService = {
    // Update user details
    async updateUserProfile(userId: string, userData: {
        name?: string;
        bio?: string;
        avatar?: string;
    }) {
        try {
            const updatedUser = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                userData
            );
            return updatedUser;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Get user profile by ID
    async getUserById(userId: string) {
        try {
            const user = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId
            );
            return user;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },
};

// Storage service for handling file uploads (avatars, images, etc.)
export const storageService = {
    // Upload a file
    async uploadFile(file: { name: string; type: string; size: number; uri: string }, bucketId: string) {
        try {
            const uploadedFile = await storage.createFile(bucketId, ID.unique(), file);
            return uploadedFile;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Get a file preview URL
    getFilePreview(bucketId: string, fileId: string, width = 400) {
        try {
            const previewUrl = storage.getFilePreview(bucketId, fileId, width);
            return previewUrl;
        } catch (error) {
            console.error('Error getting file preview:', error);
            throw error;
        }
    },

    // Delete a file
    async deleteFile(bucketId: string, fileId: string) {
        try {
            await storage.deleteFile(bucketId, fileId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },
}; 