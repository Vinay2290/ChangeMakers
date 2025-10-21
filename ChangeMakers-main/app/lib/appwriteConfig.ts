import { Client } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

const appwriteConfig = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    platformId: 'changemakers.app',
    projectId: '67f614ca000708cf3baa',
    databaseId: '67f6987700191599e88f',
    userCollectionId: '67f69a340000ad6dbaa3',
    postCollectionId: '67f69c130029a37837e3',
    projectCollectionId: '67fd095b000cb6efd474',
    memberCollectionId: '68020cd400032a13db98',
    donorCollectionId: '68020e5100146f178db8',
    endorsmentCollectionId: '68020f2d002e2f771f34',
    achievementCollectionId: '6802103b0026b085202f',
    projectDonationCollectionId: '68026cbf003798d5230c',
    taskCollectionId: '68038ec90003f1a9aba5',
    notificationCollectionId: '6803912a00346f613e41',
    brainStormCollectionId: '6803ab7f001c1a0c9016',
    postCommentCollectionId: '6803ac64000c11047c47',
    postLikeCollectionId: '6803b4290025d515c3c8',
    storageId: '67fa0e060029dbaa8e68',
}

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId); // Your project ID

export default client;