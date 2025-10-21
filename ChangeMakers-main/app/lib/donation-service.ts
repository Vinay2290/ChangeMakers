import { ID, Query } from 'appwrite';
import { appwriteConfig, databases } from './appwrite';
import { Donation } from './models';

export const donationService = {
    async getUserDonations(userId: string) {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.donorsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt')
                ]
            );

            return {
                documents: response.documents.map(doc => ({
                    donationId: doc.$id,
                    projectDonationId: doc.$id,
                    userId: doc.userId,
                    projectId: doc.projectId,
                    projectTitle: doc.projectName,
                    amount: doc.amount,
                    donatedAt: new Date(doc.$createdAt),
                    status: doc.status || 'completed'
                }))
            };
        } catch (error) {
            console.error('Error getting user donations:', error);
            throw error;
        }
    },

    async createDonation(donation: Omit<Donation, 'donationId' | 'donatedAt' | 'status'>) {
        try {
            const response = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.donorsCollectionId,
                ID.unique(),
                {
                    userId: donation.userId,
                    projectId: donation.projectId,
                    projectName: donation.projectTitle,
                    amount: donation.amount,
                    status: 'completed'
                }
            );

            return {
                donationId: response.$id,
                projectDonationId: response.$id,
                userId: response.userId,
                projectId: response.projectId,
                projectTitle: response.projectName,
                amount: response.amount,
                donatedAt: new Date(response.$createdAt),
                status: response.status
            };
        } catch (error) {
            console.error('Error creating donation:', error);
            throw error;
        }
    }
}; 