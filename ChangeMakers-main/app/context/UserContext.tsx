import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Models } from 'react-native-appwrite';

export interface User {
    $id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    location?: string;
    interests?: string[];
    trustScore?: number;
    impactScore?: number;
    achievements?: Array<{
        $id: string;
        title: string;
        description: string;
    }>;
    posts?: Array<{
        $id: string;
        title: string;
        content: string;
        likes: number;
        comments: number;
        createdAt: string;
    }>;
    memberProjects?: Array<{
        $id: string;
        name: string;
        description: string;
        location: string;
        progress: number;
        role: string;
    }>;
    donatedProjects?: Array<{
        $id: string;
        amount: number;
        projectName: string;
    }>;
    endorsements?: Models.Document[];
    impactHistory?: Models.Document[];
    trustHistory?: Models.Document[];
    $permissions?: string[];
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUserData: (data: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const updateUserData = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUserData }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 