import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import { Achievement, Donation, Endorsement, Impact, Member, Notification, Post, Project, Trust } from './models';

// Appwrite configuration
export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '67f614ca000708cf3baa',
    databaseId: '67f6987700191599e88f',
    userCollectionId: '67f69a340000ad6dbaa3',
    postCollectionId: '67f69c130029a37837e3',
    postLikeCollectionId: '6803b4290025d515c3c8',
    postCommentCollectionId: '6803ac64000c11047c47',
    projectCollectionId: '67fd095b000cb6efd474',
    memberCollectionId: '68020cd400032a13db98',
    endorsementCollectionId: '68020f2d002e2f771f34',
    taskCollectionId: '68038ec90003f1a9aba5',
    projectDonationCollectionId: '68026cbf003798d5230c',
    donorsCollectionId: '68020e5100146f178db8',
    achievementsCollectionId: '6802103b0026b085202f',
    trustCollectionId: '68079deb001623eb5586',
    impactCollectionId: '6807bd8f0021cb436b18',
    brainstormCollectionId: '6803ab7f001c1a0c9016',
    notificationCollectionId: '6803912a00346f613e41',
    storageId: '67fa0e060029dbaa8e68',
};

// Initialize Appwrite client
console.log('Initializing Appwrite client with config:', {
    endpoint: appwriteConfig.endpoint,
    projectId: appwriteConfig.projectId
});

const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

// Initialize services
console.log('Initializing Appwrite services...');
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

// // User type
// export interface User {
//     username: string;
//     email: string;
//     avatar?: string;
//     userId: string;
//     bio?: string;
//     interests?: string[];
//     isVerified: boolean;
//     trustScore: number;
//     impactScore: number;
//     joinedAt: Date;
//     locationName?: string;
//     longitude?: number;
//     latitude?: number;
// }

export interface User {
    $id: string;
    // $createdAt: string;
    // $updatedAt: string;
    // $permissions: string[];
    // $databaseId: string;
    // $collectionId: string;
    username: string;
    email: string;
    avatar?: string;
    userId: string;
    bio?: string;
    interests?: string[];
    isVerified: boolean;
    trustScore: number;
    impactScore: number;
    joinedAt: string;
    locationName?: string;
    longitude?: number;
    latitude?: number;
    posts?: Post[];
    memberProjects?: Project[];
    donations?: Donation[];
}


// Authentication functions
export const authService = {
    // Create a new user account
    async createAccount(name: string, email: string, password: string) {
        try {
            console.log('Starting account creation process...');

            // Validate input
            if (!name || !email || !password) {
                throw new Error('Name, email, and password are required');
            }

            // First, try to delete any existing sessions
            try {
                console.log('Clearing any existing sessions...');
                await account.deleteSessions();
                console.log('Existing sessions cleared');
            } catch (error) {
                console.log('No existing sessions to clear:', error);
            }

            // Create account in Appwrite
            console.log('Creating Appwrite account with:', { name, email });
            const newAccount = await account.create(
                ID.unique(),
                email,
                password,
                name
            ).catch(error => {
                console.error('Account creation failed:', error);
                throw new Error(`Account creation failed: ${error.message}`);
            });

            if (!newAccount) {
                throw new Error('Account creation returned null');
            }

            console.log('Account created successfully:', newAccount);

            await authService.login(email, password);

            const now = new Date();
            const userData = {
                userId: newAccount.$id,
                username: name,
                email,
                bio: '',
                avatar: avatars.getInitials(name),
                interests: [],
                isVerified: false,
                trustScore: 0,
                impactScore: 0,
                joinedAt: now.toISOString(),
                locationName: '',
                longitude: null,
                latitude: null
            };

            console.log('Creating user document with data:', userData);

            // Create user document in database
            const newUser = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                newAccount.$id, // Use the same ID as the account
                userData
            ).catch(error => {
                console.error('User document creation failed:', error);
                // Clean up the account if document creation fails
                account.deleteSessions().catch(console.error);
                throw new Error(`User document creation failed: ${error.message}`);
            });

            console.log('User document created successfully:', newUser);

            //     // Create a new session for the user
            //     console.log('Creating new session for user...');
            //     const session = await account.createEmailPasswordSession(email, password);
            //     console.log('Session created successfully:', session.$id);

            //     // Return both the user and session information
            return newUser;

        } catch (error: any) {
            console.error('Detailed error in createAccount:', {
                error,
                message: error?.message,
                code: error?.code,
                type: error?.type,
                stack: error?.stack
            });
            throw error;
        }
    },

    // Login user
    async login(email: string, password: string) {
        try {
            console.log('Starting login process for email:', email);

            // Validate email format
            if (!email || !email.includes('@')) {
                throw new Error('Invalid email format');
            }

            // Validate password
            if (!password || password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            // First, try to delete any existing sessions
            try {
                console.log('Clearing any existing sessions...');
                await account.deleteSessions();
                console.log('Existing sessions cleared');
            } catch (error) {
                console.log('No existing sessions to clear:', error);
            }

            // Create new session with proper error handling
            console.log('Attempting to create new session...');
            try {
                const session = await account.createEmailPasswordSession(email, password);
                console.log('New session created successfully:', {
                    sessionId: session.$id,
                    userId: session.userId,
                    created: session.$createdAt
                });

                // Verify session is active
                try {
                    const currentAccount = await account.get();
                    console.log('Current account after session creation:', {
                        id: currentAccount.$id,
                        email: currentAccount.email,
                        name: currentAccount.name,
                        status: currentAccount.status
                    });
                } catch (error) {
                    console.error('Error verifying session:', error);
                }

                return session;
            } catch (error: any) {
                console.error('Detailed session creation error:', {
                    message: error.message,
                    code: error.code,
                    type: error.type,
                    response: error.response
                });

                if (error.message.includes('Invalid credentials')) {
                    throw new Error('Invalid email or password');
                }
                throw error;
            }
        } catch (error) {
            console.error('Login process failed:', error);
            throw error;
        }
    },

    // Logout user
    async logout() {
        try {
            console.log('Starting logout process...');
            // Delete all sessions
            await account.deleteSessions();
            console.log('All sessions deleted successfully');

            // Clear any stored session data
            // sessionStorage.removeItem('session');
            console.log('Local storage cleared');
        } catch (error) {
            console.error('Error in logout process:', error);
            throw error;
        }
    },

    // Get current user with session validation
    async getCurrentUser() {
        try {
            console.log('Checking current session...');

            const currentAccount = await account.get();

            if (!currentAccount) {
                // console.log('No active session found');
                throw new Error('No active session found');
            }

            console.log('Active session found for user:', currentAccount.$id);

            // First try to get the user document directly by ID
            try {
                const userDoc = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    currentAccount.$id
                );
                console.log('User document found directly:', userDoc);
                return userDoc as unknown as User;
            } catch (error) {
                console.log('Direct document fetch failed, trying query...');
            }

            // If direct fetch fails, try querying by userId
            const currentUser = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('userId', currentAccount.$id)]
            );

            if (!currentUser.documents.length) {
                throw new Error('No user document found for account');
            }

            console.log('User document found through query:', currentUser.documents[0]);
            return currentUser.documents[0] as unknown as User;
        } catch (error) {
            console.log('Error getting current user:', error);
        }
    },
};

// // Add logging to verify configuration
// console.log('Appwrite Configuration:', {
//     endpoint: client.config.endpoint,
//     projectId: client.config.project,
//     databaseId: appwriteConfig.databaseId,
//     userCollectionId: appwriteConfig.userCollectionId
// });

export { client, account, databases, storage, ID, Query }; 
