import React, { createContext, useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import { authService, User } from '../lib/appwrite';

// Auth context type
type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    setUser: () => { },
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
    checkAuthStatus: async () => { },
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is authenticated
    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...');
            const currentUser = await authService.getCurrentUser();
            console.log('Auth check result:', currentUser);

            if (currentUser) {
                console.log('User authenticated:', currentUser);
                setUser(currentUser);
                setIsAuthenticated(true);
                router.replace('/(tabs)/home');
            } else {
                console.log('No authenticated user found');
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Login handler
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            await authService.login(email, password);
            await checkAuthStatus();
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Signup handler
    const signup = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            await authService.createAccount(name, email, password);
            // await authService.login(email, password);
            await checkAuthStatus();
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout handler
    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authService.getCurrentUser();
                if (user) {
                    setUser(user);
                    setIsAuthenticated(true);
                    router.replace('/(tabs)/home');
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                setUser,
                login,
                signup,
                logout,
                checkAuthStatus
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 