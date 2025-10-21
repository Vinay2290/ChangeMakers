import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Project } from '../lib/models';
import { userService } from '../lib/user-service';
import { useAuth } from '../context/auth-context';

const COLORS = {
    gray: {
        dark: '#343a40',
        medium: '#6c757d',
        light: '#f8f9fa'
    }
};

export default function UserProjectsScreen() {
    const { user } = useAuth()
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    if (!user) {
        Alert.alert('Error', 'User not found');
        return;
    }

    useEffect(() => {
        loadProjects();
    }, [user.$id]);

    const loadProjects = async () => {
        try {
            const response = await userService.getUserProjects(user.$id);
            setProjects(response.documents.map(doc => ({
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
            })));
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProject = ({ item }: { item: Project }) => (
        <TouchableOpacity
            style={styles.projectCard}
            onPress={() => router.push(`/project/${item.projectId}`)}
        >
            <Image
                source={{ uri: item.project_image || 'https://via.placeholder.com/150' }}
                style={styles.projectImage}
            />
            <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{item.title}</Text>
                <Text style={styles.projectLocation}>{item.location}</Text>
                <View style={styles.projectStats}>
                    <Text style={styles.statText}>{item.memberCount} members</Text>
                    <Text style={styles.statText}>{item.progress}% complete</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={projects}
                renderItem={renderProject}
                keyExtractor={item => item.projectId}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No projects found</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 16,
    },
    projectCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    projectImage: {
        width: 100,
        height: 100,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    projectInfo: {
        flex: 1,
        padding: 12,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginBottom: 4,
    },
    projectLocation: {
        fontSize: 14,
        color: COLORS.gray.dark,
        marginBottom: 8,
    },
    projectStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statText: {
        fontSize: 12,
        color: COLORS.gray.dark,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
}); 