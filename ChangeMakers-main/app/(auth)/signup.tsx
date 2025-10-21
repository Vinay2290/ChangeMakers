import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../context/auth-context';

const COLORS = {
    primary: '#007BFF',
    white: '#FFFFFF',
    black: '#000000',
    gray: {
        light: '#f8f9fa',
        medium: '#6c757d',
        dark: '#343a40'
    },
    danger: '#dc3545',
};

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup, isLoading } = useAuth();

    const handleSignup = async () => {
        // Reset error state
        setError('');

        // Validate credentials
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Basic password validation (at least 8 characters)
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            // Call the signup method from auth context
            await signup(name, email, password);
            // Navigation is handled in the auth context
        } catch (err: any) {
            // Handle signup error
            setError(err.message || 'An error occurred during signup');
            Alert.alert('Signup Failed', 'Failed to create account. Please try again.');
        }
    };

    const navigateToLogin = () => {
        router.push('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Logo/App Title */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.appTitle}>ChangeMakers</Text>
                        <Text style={styles.appTagline}>Connect. Collaborate. Change.</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Create Account</Text>
                        <Text style={styles.formSubtitle}>Join our community of changemakers</Text>

                        {/* Error message */}
                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}

                        {/* Name field */}
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!isLoading}
                        />

                        {/* Email field */}
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />

                        {/* Password field */}
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />

                        {/* Sign up button */}
                        <TouchableOpacity
                            style={styles.authButton}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.authButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        {/* Login link */}
                        <TouchableOpacity
                            style={styles.toggleContainer}
                            onPress={navigateToLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.toggleText}>
                                Already have an account? <Text style={styles.toggleLink}>Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 16,
        color: COLORS.gray.medium,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.gray.dark,
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: COLORS.gray.medium,
        marginBottom: 24,
    },
    input: {
        backgroundColor: COLORS.gray.light,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    authButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    authButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    toggleContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
        color: COLORS.gray.medium,
    },
    toggleLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: 16,
        fontSize: 14,
    },
}); 