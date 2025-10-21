import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { projectService } from '../lib/project-service';
import { useAuth } from '../context/auth-context';
import { Achievement } from '../lib/models';

const CATEGORIES = [
    'Environment',
    'Education',
    'Health',
    'Community',
    'Technology',
    'Arts',
    'Sports',
    'Other'
];

export default function CreateProjectScreen() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [location, setLocation] = useState('');
    const [longitude, setLongitude] = useState<number | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([
        { achievementId: '1', title: '', description: '', projectId: "" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to create a project');
                return;
            }
        })();
    }, []);

    const handleLocationSelect = async () => {
        try {
            setIsLoading(true);
            console.log('Attempting to geocode location:', location);
            const result = await Location.geocodeAsync(location);
            console.log('Geocoding result:', result);

            if (result.length > 0) {
                const { latitude, longitude } = result[0];
                console.log('Setting coordinates:', { latitude, longitude });
                setLatitude(latitude);
                setLongitude(longitude);
                Alert.alert('Location Found', 'Location has been set successfully');
            } else {
                Alert.alert('Error', 'Could not find the specified location');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            Alert.alert('Error', 'Failed to get location coordinates. Please fill in valid location');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
            });

            if (!result.canceled) {
                setBannerImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const addAchievement = () => {
        setAchievements(prev => [
            ...prev,
            {
                achievementId: (prev.length + 1).toString(),
                title: '',
                description: '',
                projectId: ""
            }
        ]);
    };

    const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
        setAchievements(prev => prev.map(achievement =>
            achievement.achievementId === id ? { ...achievement, [field]: value } : achievement
        ));
    };

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to create a project');
            return;
        }

        console.log('Current coordinates:', { latitude, longitude });

        if (!title.trim() || !description.trim() || selectedCategories.length === 0 ||
            !location.trim() || !bannerImage || !longitude || !latitude) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setIsLoading(true);
            console.log('Creating project with coordinates:', { latitude, longitude });
            const project = await projectService.createProject(
                user.$id,
                user.username,
                title,
                description,
                location,
                longitude,
                latitude,
                selectedCategories,
                bannerImage,
                true,
                false
            );

            // Create achievements for the project
            for (const achievement of achievements) {
                if (achievement.title.trim() && achievement.description.trim()) {
                    await projectService.addAchievement(
                        project.$id,
                        achievement.title,
                        achievement.description
                    );
                }
            }

            // Reset form
            setTitle('');
            setDescription('');
            setSelectedCategories([]);
            setLocation('');
            setLongitude(null);
            setLatitude(null);
            setBannerImage(null);
            setAchievements([{ achievementId: '1', title: '', description: '', projectId: "" }]);

            Alert.alert('Success', 'Project created successfully');
            router.back();
        } catch (error) {
            console.error('Project creation error:', error);
            Alert.alert('Error', 'Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Project</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                    {/* Banner Image */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Project Banner *</Text>
                        <TouchableOpacity
                            style={styles.imagePicker}
                            onPress={pickImage}
                        >
                            {bannerImage ? (
                                <Image
                                    source={{ uri: bannerImage }}
                                    style={styles.bannerImage}
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <MaterialIcons name="add-photo-alternate" size={40} color="#666" />
                                    <Text style={styles.imagePlaceholderText}>Add Banner Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Basic Information */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Project Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter project title"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Categories *</Text>
                        <View style={styles.categoriesContainer}>
                            {CATEGORIES.map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategories.includes(category) && styles.selectedCategory
                                    ]}
                                    onPress={() => toggleCategory(category)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategories.includes(category) && styles.selectedCategoryText
                                    ]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Location *</Text>
                        <View style={styles.locationContainer}>
                            <TextInput
                                style={[styles.input, styles.locationInput]}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Enter project location"
                            />
                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={handleLocationSelect}
                                disabled={isLoading}
                            >
                                <MaterialIcons name="location-on" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                        {longitude && latitude && (
                            <Text style={styles.coordinatesText}>
                                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your project"
                            multiline
                            numberOfLines={6}
                        />
                    </View>

                    {/* Achievements */}
                    <View style={styles.inputContainer}>
                        <View style={styles.milestoneHeader}>
                            <Text style={styles.label}>Project Achievements</Text>
                            <TouchableOpacity onPress={addAchievement}>
                                <MaterialIcons name="add-circle" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                        {achievements.map((achievement) => (
                            <View key={achievement.achievementId} style={styles.milestoneItem}>
                                <TextInput
                                    style={styles.input}
                                    value={achievement.title}
                                    onChangeText={(value) => updateAchievement(achievement.achievementId, 'title', value)}
                                    placeholder="Achievement title"
                                />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={achievement.description}
                                    onChangeText={(value) => updateAchievement(achievement.achievementId, 'description', value)}
                                    placeholder="Achievement description"
                                    multiline
                                />
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <Text style={styles.submitButtonText}>
                        {isLoading ? 'Creating...' : 'Create Project'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    imagePicker: {
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#666',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCategory: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        color: '#333',
    },
    selectedCategoryText: {
        color: '#fff',
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
        padding: 8,
    },
    coordinatesText: {
        marginTop: 4,
        fontSize: 12,
        color: '#666',
    },
    milestoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    milestoneItem: {
        marginBottom: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 