import { ID } from 'appwrite';
import { appwriteConfig, databases } from './appwrite';

export const notificationService = {
    async sendVolunteerRequest(
        userId: string,
        projectCreatorId: string,
        projectId: string,
        projectTitle: string
    ) {
        try {
            const now = new Date().toISOString();
            const notificationId = ID.unique()

            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                notificationId,
                {
                    notificationId: notificationId,
                    type: 'volunteer_request',
                    userId: projectCreatorId,
                    senderId: userId,
                    projectId,
                    projectTitle,
                    read: false,
                    timestamp: now
                }
            );
        } catch (error) {
            console.error('Error sending volunteer request:', error);
            throw error;
        }
    }
}; 