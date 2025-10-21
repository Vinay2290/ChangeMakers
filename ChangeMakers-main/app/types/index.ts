export interface Project {
    id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    image: string;
    members: number;
    progress: number;
    fundingRaised: number;
    fundingGoal: number;
    volunteers: number;
    profilePicture: string;
}

export interface Post {
    id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    mediaItems: Array<{
        uri: string;
        type: 'image' | 'video';
    }>;
    username: string;
    timestamp: string;
}

export type FeedItem = Project | Post; 