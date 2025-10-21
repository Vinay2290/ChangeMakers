import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Modal, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Project, Post } from './lib/models';
import { userService } from './lib/user-service';
import { postService } from './lib/post-service';
import { useAuth } from './context/auth-context';

const COLORS = {
    primary: '#007AFF',
    gray: {
        light: '#f8f9fa',
        medium: '#6c757d',
        dark: '#343a40'
    },
    white: '#FFFFFF'
};

interface MediaItem {
    uri: string;
    type: 'image' | 'video';
}

export default function CreatePostScreen() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUserProjects();
    }, []);

    const loadUserProjects = async () => {
        try {
            if (!user) {
                Alert.alert('Error', 'User not found');
                return;
            }
            const response = await userService.getUserProjects(user.$id);
            const mappedProjects = response.documents.map(doc => ({
                projectId: doc.$id,
                title: doc.name,
                description: doc.description,
                creatorId: doc.creatorId,
                creatorName: doc.creatorName,
                location: doc.location,
                memberCount: doc.memberCount || 0,
                progress: doc.progress || 0,
                totalDonation: doc.totalDonation || 0,
                volunteerRequired: doc.volunteerRequired || false,
                completed: doc.completed || false,
                category: doc.category || [],
                createdAt: new Date(doc.$createdAt),
                fundingRequired: doc.fundingRequired || false,
                longitude: doc.longitude || 0,
                latitude: doc.latitude || 0
            }));
            setProjects(mappedProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
            Alert.alert('Error', 'Failed to load projects');
        }
    };

    const pickMedia = async (type: 'image' | 'video') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: type === 'image' ? 'images' : 'videos',
                allowsEditing: true,
                quality: 1,
                allowsMultipleSelection: false,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setMediaItems(prev => [...prev, {
                    uri: asset.uri,
                    type
                }]);
            }
        } catch (error) {
            console.error('Error picking media:', error);
            Alert.alert('Error', 'Failed to pick media');
        }
    };

    const removeMedia = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project);
        setLocation(project.location);
        setShowProjectModal(false);
    };

    const handleCreatePost = async () => {
        if (!title.trim() || !description.trim() || !location.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!selectedProject) {
            Alert.alert('Error', 'Please select a project');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'User not found');
            return;
        }

        setLoading(true);
        try {
            const postData = {
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                projectId: selectedProject.projectId,
                authorId: user.$id,
                authorName: user.username,
                likes: 0,
                comments: 0,
                media: mediaItems.map(item => item.uri),
                // postedAt: new Date(),
                // updatedAt: new Date()
            };

            await postService.createPost(
                user.$id,
                user.username,
                postData.title,
                postData.description,
                postData.location,
                postData.media,
                postData.projectId
            );

            Alert.alert(
                'Success',
                'Post created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Create Post',
                    headerShown: true,
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter post title"
                            placeholderTextColor={COLORS.gray.medium}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter post description"
                            placeholderTextColor={COLORS.gray.medium}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Project</Text>
                        <TouchableOpacity
                            style={styles.projectSelector}
                            onPress={() => setShowProjectModal(true)}
                        >
                            <Text style={selectedProject ? styles.selectedProjectText : styles.placeholderText}>
                                {selectedProject ? selectedProject.title : 'Select a project'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.gray.medium} />
                        </TouchableOpacity>
                    </View>

                    {/* <View style={styles.inputContainer}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Enter location"
                            placeholderTextColor={COLORS.gray.medium}
                            editable={!selectedProject}
                        />
                    </View> */}

                    {/* <View style={styles.inputContainer}>
                        <Text style={styles.label}>Category</Text>
                        <TextInput
                            style={styles.input}
                            value={category}
                            onChangeText={setCategory}
                            placeholder="Enter category"
                            placeholderTextColor={COLORS.gray.medium}
                        />
                    </View> */}

                    <View style={styles.mediaContainer}>
                        <Text style={styles.label}>Media</Text>
                        <View style={styles.mediaGrid}>
                            {mediaItems.map((item, index) => (
                                <View key={index} style={styles.mediaItem}>
                                    {item.type === 'image' ? (
                                        <Image
                                            source={{ uri: item.uri }}
                                            style={styles.mediaPreview}
                                        />
                                    ) : (
                                        <View style={styles.videoPreview}>
                                            <MaterialIcons name="play-circle-outline" size={40} color={COLORS.white} />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        style={styles.removeMediaButton}
                                        onPress={() => removeMedia(index)}
                                    >
                                        <MaterialIcons name="close" size={20} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {mediaItems.length < 5 && (
                                <TouchableOpacity
                                    style={styles.addMediaButton}
                                    onPress={() => Alert.alert(
                                        'Add Media',
                                        'Choose media type',
                                        [
                                            {
                                                text: 'Photo',
                                                onPress: () => pickMedia('image')
                                            },
                                            {
                                                text: 'Video',
                                                onPress: () => pickMedia('video')
                                            },
                                            {
                                                text: 'Cancel',
                                                style: 'cancel'
                                            }
                                        ]
                                    )}
                                >
                                    <MaterialIcons name="add-photo-alternate" size={32} color={COLORS.primary} />
                                    <Text style={styles.addMediaText}>Add Media</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.createButton, loading && styles.disabledButton]}
                        onPress={handleCreatePost}
                        disabled={loading}
                    >
                        <Text style={styles.createButtonText}>
                            {loading ? 'Creating...' : 'Create Post'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={showProjectModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProjectModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Project</Text>
                        <FlatList
                            data={projects}
                            keyExtractor={item => item.projectId}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.projectItem}
                                    onPress={() => handleProjectSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.projectItemText}>{item.title}</Text>
                                    <Text style={styles.projectLocation}>{item.location}</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.projectList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No projects found</Text>
                            }
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowProjectModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    form: {
        padding: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.gray.light,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.gray.dark,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    projectSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.gray.light,
        borderRadius: 8,
        padding: 12,
    },
    selectedProjectText: {
        fontSize: 16,
        color: COLORS.gray.dark,
    },
    placeholderText: {
        fontSize: 16,
        color: COLORS.gray.medium,
    },
    mediaContainer: {
        marginBottom: 20,
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    mediaItem: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.gray.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeMediaButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    addMediaButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: COLORS.gray.light,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    addMediaText: {
        marginTop: 4,
        fontSize: 12,
        color: COLORS.primary,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.7,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 16,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginBottom: 16,
        textAlign: 'center',
    },
    projectList: {
        paddingVertical: 8,
    },
    projectItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray.light,
        backgroundColor: COLORS.white,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    projectItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginBottom: 4,
    },
    projectLocation: {
        fontSize: 14,
        color: COLORS.gray.dark,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray.medium,
        padding: 20,
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: '600',
    },
}); 