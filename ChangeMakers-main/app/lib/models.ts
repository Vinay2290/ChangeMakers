import { User } from './appwrite';

// Post Model
export interface Post {
    title: string;
    description: string;
    media?: string[]; // Array of URLs
    postId: string;
    location: string;
    projectId?: string;
    likes: number;
    comments: number;
    postedAt: Date;
    updatedAt?: Date;
    authorName: string;
    authorId: string;
}

// PostLike Model
export interface PostLike {
    id: string;
    userId: string;
    postId: string;
    createdAt: Date;
}

// PostComment Model
export interface PostComment {
    id: string;
    userId: string;
    postId: string;
    comment: string;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
}

// Project Model
export interface Project {
    projectId: string;
    title: string;
    description: string;
    project_image?: string;
    creatorId: string;
    creatorName: string;
    location: string;
    memberCount: number;
    progress: number;
    totalDonation: number;
    volunteerRequired: boolean;
    completed: boolean;
    category: string[];
    createdAt: Date;
    endedAt?: Date;
    fundingRequired: boolean;
    longitude: Number;
    latitude: Number;
}

// ProjectDonation Model
export interface ProjectDonation {
    id: string;
    projectDonationId: string;
    projectId: string;
    fundingGoal: number;
    status: boolean; // funding ongoing or completed, default true
    startedAt: Date;
    endedAt?: Date;
    aim: string; // objective for the donation held
    fundingRaised: number;
}

// Donor Model
export interface Donation {
    donationId: string;
    projectDonationId: string;
    userId: string;
    projectId: string;
    projectTitle: string;
    amount: number;
    donatedAt: Date;
    status: string;
}

// Endorsement Model
export interface Endorsement {
    id: string;
    endorsementId: string;
    userId: string;
    projectId: string;
    rating: number;
    review: string;
    timestamp: Date;
    user?: User;
}

// Member Model (formerly ProjectMember)
export interface Member {
    id: string;
    memberId: string;
    projectId: string;
    userId: string;
    role: string;
    currentMember: boolean;
    joinedAt: Date;
    leftAt?: Date;
    tasksCompleted: number;
    hoursContributed: number;
    projectTitle: string;
    user?: User;
}

// Task Model
export interface Task {
    id: string;
    taskId: string;
    projectId: string;
    subject: string;
    description: string;
    status: boolean; // completed or not, default false
    assignedAt: Date;
    deadline?: Date;
    completedAt?: Date;
    assignedBy: string;
    assignedTo: string[]; // Array of user IDs
}

// Brainstorm Model
export interface Brainstorm {
    id: string;
    brainstormId: string;
    projectId: string;
    authorId: string; // memberId from members collection
    content: string;
    submittedAt: Date;
    upvotes: number;
}

// Achievement Model
export interface Achievement {
    achievementId: string;
    projectId: string;
    title: string;
    description: string;
}

// Trust Model
export interface Trust {
    id: string;
    trustor: string; // User who voted
    trustee: string; // User who received the vote
    createdAt: Date;
}

// Impact Model
export interface Impact {
    id: string;
    userId: string; // User who received the vote
    voterId: string; // User who voted
    createdAt: Date;
}

// Notification Model
export interface Notification {
    id: string;
    notificationId: string;
    userId: string;
    message: string;
    timestamp: Date;
    read: boolean; // default false
    type: string;
    relatedId: string[]; // Array of related IDs
} 