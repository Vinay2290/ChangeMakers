import { ID, Query } from 'react-native-appwrite';
import { appwriteConfig, databases, User } from './appwrite';
import { Endorsement, Achievement, Trust, Impact, Notification } from './models';
import { Models } from 'react-native-appwrite';

export const userService = {
    // Get user profile with all related data
    async getUserProfile(userId: string): Promise<User> {
        try {
            console.log('Fetching user profile for ID:', userId);
            console.log('Using database ID:', appwriteConfig.databaseId);
            console.log('Using collection ID:', appwriteConfig.userCollectionId);

            const userDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId
            );
            console.log('User document fetched successfully:', userDoc);

            // Get user posts
            const posts = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                [Query.equal('authorId', userId)]
            );
            console.log('User posts fetched successfully:', posts);

            // Get user projects
            const projects = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                [Query.equal('creatorId', userId)]
            );
            console.log('User projects fetched successfully:', projects);

            // Get user donations
            const donations = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.donorsCollectionId,
                [Query.equal('userId', userId)]
            );
            console.log('User donations fetched successfully:', donations);

            return {
                $id: userDoc.$id,
                userId: userDoc.$userId,
                username: userDoc.username,
                email: userDoc.email,
                avatar: userDoc.avatar,
                bio: userDoc.bio,
                locationName: userDoc.locationName,
                longitude: userDoc.longitude,
                latitude: userDoc.latitude,
                isVerified: userDoc.isVerified,
                joinedAt: userDoc.joinedAt,
                interests: userDoc.interests,
                trustScore: userDoc.trustScore,
                impactScore: userDoc.impactScore,
                posts: posts.documents.map(doc => ({
                    postId: doc.postId,
                    title: doc.title,
                    description: doc.description,
                    location: doc.location || '',
                    likes: doc.likes || 0,
                    comments: doc.comments || 0,
                    postedAt: new Date(doc.$createdAt),
                    authorName: userDoc.username,
                    authorId: userId
                })),
                memberProjects: projects.documents.map(doc => ({
                    projectId: doc.projectId,
                    title: doc.name,
                    description: doc.description,
                    creatorId: doc.creatorId,
                    creatorName: doc.creatorName,
                    location: doc.location,
                    memberCount: 0,
                    progress: doc.progress,
                    totalDonation: 0,
                    volunteerRequired: false,
                    completed: false,
                    category: [],
                    createdAt: new Date(doc.$createdAt),
                    fundingRequired: false,
                    longitude: doc.longitude,
                    latitude: doc.latitude
                })),
                donations: donations.documents.map(doc => ({
                    donationId: doc.donationId,
                    projectDonationId: doc.projectDonationId,
                    userId: userId,
                    projectId: doc.projectId,
                    projectTitle: doc.projectName,
                    amount: doc.amount,
                    donatedAt: new Date(doc.$createdAt),
                    status: 'completed'
                }))
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Update user profile
    async updateUserProfile(userId: string, data: {
        username?: string;
        bio?: string;
        locationName?: string;
        interests?: string[];
        avatar?: string;
    }) {
        try {
            console.log('Updating user profile for ID:', userId, 'with data:', data);

            const updatedUser = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                data
            );

            console.log('User profile updated successfully:', updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Add achievement
    async addAchievement(userId: string, achievement: {
        title: string;
        description: string;
        icon: string;
        date: string;
    }) {
        try {
            console.log('Adding achievement for user:', userId);

            const newAchievement = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.achievementsCollectionId,
                ID.unique(),
                {
                    userId,
                    ...achievement
                }
            );

            console.log('Achievement added successfully:', newAchievement);
            return newAchievement;
        } catch (error) {
            console.error('Error adding achievement:', error);
            throw error;
        }
    },

    async getUserProjects(userId: string) {
        console.log("user-services.getUserProjects function called");
        // Get user projects
        try {
            const projects = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                [Query.equal('creatorId', userId)]
            );
            if (!projects) {
                console.log("no projects");
            }
            console.log(projects.documents.length);
            return projects;
        }
        catch (error) {
            console.error('Error fetching user projects:', error);
            throw error;
        }
    },

    // Update user scores
    async updateUserScores(userId: string, scores: {
        trustScore?: number;
        impactScore?: number;
    }) {
        try {
            console.log('Updating user scores for ID:', userId, 'with scores:', scores);

            const updatedUser = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                scores
            );

            console.log('User scores updated successfully:', updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Error updating user scores:', error);
            throw error;
        }
    },

    // Add an endorsement to a project
    async addEndorsement(userId: string, projectId: string, rating: number, review: string) {
        try {
            const now = new Date().toISOString();

            const endorsement = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.endorsementCollectionId,
                ID.unique(),
                {
                    endorsementId: ID.unique(),
                    userId,
                    projectId,
                    rating,
                    review,
                    timestamp: now
                }
            );

            return endorsement;
        } catch (error) {
            console.error('Error adding endorsement:', error);
            throw error;
        }
    },

    // Get endorsements for a project
    async getProjectEndorsements(projectId: string) {
        try {
            const endorsements = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.endorsementCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.orderDesc('timestamp')
                ]
            );

            return endorsements;
        } catch (error) {
            console.error('Error fetching project endorsements:', error);
            throw error;
        }
    },

    // Get endorsements by a user
    async getUserEndorsements(userId: string) {
        try {
            const endorsements = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.endorsementCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('timestamp')
                ]
            );

            return endorsements;
        } catch (error) {
            console.error('Error fetching user endorsements:', error);
            throw error;
        }
    },

    // Get achievements for a user
    async getUserAchievements(userId: string) {
        try {
            const achievements = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.achievementsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('timestamp')
                ]
            );

            return achievements;
        } catch (error) {
            console.error('Error fetching user achievements:', error);
            throw error;
        }
    },

    // Add trust vote (increases trust score)
    async voteTrust(trustorId: string, trusteeId: string) {
        try {
            // Check if already voted
            const existingVotes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.trustCollectionId,
                [
                    Query.equal('trustor', trustorId),
                    Query.equal('trustee', trusteeId)
                ]
            );

            if (existingVotes.documents.length > 0) {
                return { success: false, message: 'Already voted' };
            }

            const now = new Date().toISOString();

            // Create trust vote
            const trust = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.trustCollectionId,
                ID.unique(),
                {
                    trustor: trustorId,
                    trustee: trusteeId,
                    createdAt: now
                }
            );

            // Update user trust score
            await this.updateUserTrustScore(trusteeId);

            // Create notification
            await this.createNotification(
                trusteeId,
                `Someone trusted you! Your trust score has increased.`,
                'trust',
                [trustorId]
            );

            return trust;
        } catch (error) {
            console.error('Error voting trust:', error);
            throw error;
        }
    },

    // Add impact vote (increases impact score)
    async voteImpact(voterId: string, userId: string) {
        try {
            // Check if already voted
            const existingVotes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.impactCollectionId,
                [
                    Query.equal('voterId', voterId),
                    Query.equal('userId', userId)
                ]
            );

            if (existingVotes.documents.length > 0) {
                return { success: false, message: 'Already voted' };
            }

            const now = new Date().toISOString();

            // Create impact vote
            const impact = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.impactCollectionId,
                ID.unique(),
                {
                    userId,
                    voterId,
                    createdAt: now
                }
            );

            // Update user impact score
            await this.updateUserImpactScore(userId);

            // Create notification
            await this.createNotification(
                userId,
                `Someone recognized your impact! Your impact score has increased.`,
                'impact',
                [voterId]
            );

            return impact;
        } catch (error) {
            console.error('Error voting impact:', error);
            throw error;
        }
    },

    // Update user trust score based on votes
    async updateUserTrustScore(userId: string) {
        try {
            // Get trust votes count
            const trustVotes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.trustCollectionId,
                [Query.equal('trustee', userId)]
            );

            const trustScore = trustVotes.documents.length;

            // Update user document with new score
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                { trustScore }
            );

            return { success: true, trustScore };
        } catch (error) {
            console.error('Error updating trust score:', error);
            throw error;
        }
    },

    // Update user impact score based on votes
    async updateUserImpactScore(userId: string) {
        try {
            // Get impact votes count
            const impactVotes = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.impactCollectionId,
                [Query.equal('userId', userId)]
            );

            const impactScore = impactVotes.documents.length;

            // Update user document with new score
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                { impactScore }
            );

            return { success: true, impactScore };
        } catch (error) {
            console.error('Error updating impact score:', error);
            throw error;
        }
    },

    // Create a notification
    async createNotification(userId: string, message: string, type: string, relatedId: string[] = []) {
        try {
            const now = new Date().toISOString();

            const notification = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                ID.unique(),
                {
                    notificationId: ID.unique(),
                    userId,
                    message,
                    timestamp: now,
                    read: false,
                    type,
                    relatedId
                }
            );

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    // Get user notifications
    async getUserNotifications(userId: string, unreadOnly = false) {
        try {
            let queries = [
                Query.equal('userId', userId),
                Query.orderDesc('timestamp')
            ];

            if (unreadOnly) {
                queries.push(Query.equal('read', false));
            }

            const notifications = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                queries
            );

            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Mark notification as read
    async markNotificationAsRead(notificationId: string) {
        try {
            const updatedNotification = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationCollectionId,
                notificationId,
                {
                    read: true
                }
            );

            return updatedNotification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all notifications as read
    async markAllNotificationsAsRead(userId: string) {
        try {
            // Get all unread notifications
            const unreadNotifications = await this.getUserNotifications(userId, true);

            // Mark each as read
            const updatePromises = unreadNotifications.documents.map(notification =>
                this.markNotificationAsRead(notification.$id)
            );

            await Promise.all(updatePromises);

            return { success: true };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
}; 