import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import ImagePreviewModal from './components/ImagePreviewModal';
import { useAuth } from './context/auth-context';
import { databases, storage, appwriteConfig } from './lib/appwrite';
import { ID } from 'react-native-appwrite';
import { User } from './lib/appwrite';

// Color constants (same as other pages)
const COLORS = {
    primary: '#007BFF',
    success: '#28A745',
    alert: '#DC3545',
    gray: {
        light: '#f8f9fa',
        medium: '#6c757d',
        dark: '#343a40'
    },
    white: '#FFFFFF'
} as const;

interface FormErrors {
    username?: string;
    location?: string;
    bio?: string;
}

export default function EditProfileScreen() {
    const { user, setUser } = useAuth();
    const [newInterest, setNewInterest] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        locationName: user?.locationName || '',
        bio: user?.bio || '',
        interests: user?.interests || [],
        longitude: user?.longitude || undefined,
        latitude: user?.latitude || undefined
    });

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Location permission is required to update your location.',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        },
                        {
                            text: 'Settings',
                            onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
        }
    };

    const updateLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            setFormData(prev => ({
                ...prev,
                longitude: location.coords.longitude,
                latitude: location.coords.latitude
            }));
            setHasChanges(true);
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get your location. Please try again.');
        }
    };

    const validateForm = (data: typeof formData): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!data.bio.trim()) {
            data.bio = 'Change Makers';
        }

        return newErrors;
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const newErrors = validateForm(formData);
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            if (!user) {
                throw new Error('User not found');
            }

            // Only update the fields that can be modified
            const updatedFields = {
                username: formData.username,
                bio: formData.bio,
                interests: formData.interests,
                locationName: formData.locationName,
                longitude: formData.longitude,
                latitude: formData.latitude
            };

            const updatedDoc = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                user.$id,
                updatedFields
            );

            // Update local user state
            const updatedUser: User = {
                ...user,
                ...updatedFields
            };
            setUser(updatedUser);

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (uri: string) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            const file = {
                uri,
                name: `avatar-${Date.now()}.jpg`,
                type: 'image/jpeg',
                size: fileInfo.size || 0
            };

            const uploadedFile = await storage.createFile(
                appwriteConfig.storageId,
                ID.unique(),
                file
            );

            const fileUrl = storage.getFileView(
                appwriteConfig.storageId,
                uploadedFile.$id
            );

            return fileUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setIsUploading(true);

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            // Create file object with required properties
            const file = {
                uri,
                name: `avatar-${Date.now()}.jpg`,
                type: 'image/jpeg',
                size: fileInfo.size
            } as any;

            // Upload image to storage
            const uploadedFile = await storage.createFile(
                appwriteConfig.storageId,
                ID.unique(),
                file
            );

            // Get file URL
            const fileUrl = storage.getFileView(
                appwriteConfig.storageId,
                uploadedFile.$id
            );

            // Update user's avatar
            if (user?.$id) {
                const updatedDoc = await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    user.$id,
                    { avatar: fileUrl.toString() }
                );

                const updatedUser: User = {
                    ...user,
                    avatar: fileUrl.toString()
                };
                setUser(updatedUser);
            }

            setHasChanges(true);
            setIsPreviewVisible(false);
            setPreviewImage(null);

            Alert.alert('Success', 'Profile picture updated successfully!');
            return fileUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const pickImage = async (useCamera: boolean = false) => {
        try {
            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            };

            let result;
            if (useCamera) {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled) {
                setPreviewImage(result.assets[0].uri);
                setIsPreviewVisible(true);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const addInterest = () => {
        if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, newInterest.trim()]
            }));
            setNewInterest('');
            setHasChanges(true);
        }
    };

    const removeInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
        setHasChanges(true);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Edit Profile',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.headerButton}
                            disabled={isSaving}
                        >
                            <MaterialIcons name="arrow-back" size={24} color={COLORS.gray.dark} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleSave}
                            style={styles.headerButton}
                            disabled={isSaving || !hasChanges}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <Text style={[
                                    styles.saveButton,
                                    (!hasChanges && styles.saveButtonDisabled)
                                ]}>
                                    Save
                                </Text>
                            )}
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView style={styles.container}>
                {/* Profile Picture */}
                <View style={styles.avatarContainer}>
                    {isUploading ? (
                        <View style={styles.avatarLoading}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => Alert.alert(
                                'Change Profile Picture',
                                'Choose an option',
                                [
                                    {
                                        text: 'Take Photo',
                                        onPress: () => pickImage(true)
                                    },
                                    {
                                        text: 'Choose from Gallery',
                                        onPress: () => pickImage(false)
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    }
                                ]
                            )}
                            style={styles.avatarTouchable}
                        >
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarPlaceholderText}>
                                        {user?.username?.[0]?.toUpperCase() || '👤'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={[styles.input, errors.username && styles.inputError]}
                            value={formData.username}
                            onChangeText={(text) => updateField('username', text)}
                            placeholder="Your username"
                        />
                        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.locationContainer}>
                            <TextInput
                                style={[styles.input, styles.locationInput, errors.location && styles.inputError]}
                                value={formData.locationName}
                                onChangeText={(text) => updateField('locationName', text)}
                                placeholder="Your location"
                            />
                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={updateLocation}
                            >
                                <MaterialIcons name="my-location" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput, errors.bio && styles.inputError]}
                            value={formData.bio}
                            onChangeText={(text) => updateField('bio', text)}
                            placeholder="Tell us about yourself"
                            multiline
                            numberOfLines={4}
                        />
                        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
                    </View>
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <View style={styles.interestsContainer}>
                        {formData.interests.map((interest, index) => (
                            <View key={index} style={styles.interestTag}>
                                <Text style={styles.interestText}>{interest}</Text>
                                <TouchableOpacity
                                    onPress={() => removeInterest(interest)}
                                    style={styles.removeInterestButton}
                                >
                                    <MaterialIcons name="close" size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    <View style={styles.addInterestContainer}>
                        <TextInput
                            style={styles.addInterestInput}
                            value={newInterest}
                            onChangeText={setNewInterest}
                            placeholder="Add an interest"
                            onSubmitEditing={addInterest}
                        />
                        <TouchableOpacity
                            style={styles.addInterestButton}
                            onPress={addInterest}
                        >
                            <MaterialIcons name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <ImagePreviewModal
                visible={isPreviewVisible}
                imageUri={previewImage || ''}
                onConfirm={() => {
                    previewImage && uploadImage(previewImage);
                }}
                onCancel={() => {
                    setIsPreviewVisible(false);
                    setPreviewImage(null);
                }}
                isUploading={isUploading}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray.light,
    },
    avatarContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatarTouchable: {
        marginBottom: 12,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.gray.light,
    },
    avatarPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.gray.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        fontSize: 80,
    },
    avatarLoading: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.gray.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    section: {
        backgroundColor: COLORS.white,
        padding: 16,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray.dark,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: COLORS.gray.medium,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.gray.dark,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationInput: {
        flex: 1,
        marginRight: 8,
    },
    locationButton: {
        padding: 12,
        backgroundColor: COLORS.gray.light,
        borderRadius: 8,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    interestTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    interestText: {
        color: COLORS.primary,
        marginRight: 8,
        fontWeight: '500',
    },
    removeInterestButton: {
        padding: 2,
    },
    addInterestContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    addInterestInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.gray.dark,
    },
    addInterestButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginHorizontal: 4,
    },
    saveButton: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonDisabled: {
        color: COLORS.gray.medium,
    },
    inputError: {
        borderColor: COLORS.alert,
    },
    errorText: {
        color: COLORS.alert,
        fontSize: 12,
        marginTop: 4,
    },
}); 