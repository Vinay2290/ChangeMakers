import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Project {
    id: string;
    title: string;
    role: string;
    status: 'active' | 'completed';
}

// Dummy data - in a real app, this would come from an API
const USER_PROJECTS: Project[] = [
    {
        id: '1',
        title: 'Environmental Cleanup Initiative',
        role: 'Project Admin',
        status: 'active'
    },
    {
        id: '2',
        title: 'Tree Planting Campaign',
        role: 'Volunteer',
        status: 'completed'
    },
    {
        id: '3',
        title: 'Community Garden Project',
        role: 'Coordinator',
        status: 'active'
    },
    {
        id: '4',
        title: 'Recycling Awareness Program',
        role: 'Volunteer',
        status: 'completed'
    }
];

const ProjectItem = ({ project }: { project: Project }) => (
    <View style={styles.projectItem}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <View style={styles.projectMeta}>
            <Text style={styles.projectRole}>{project.role}</Text>
            <View style={[
                styles.statusBadge,
                project.status === 'active' && styles.activeBadge
            ]}>
                <Text style={styles.statusText}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Text>
            </View>
        </View>
    </View>
);

export default function UserProjectsScreen() {
    const { id } = useLocalSearchParams();

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'My Projects',
                    headerBackTitle: 'Back'
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={USER_PROJECTS}
                    renderItem={({ item }) => <ProjectItem project={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        padding: 16,
    },
    projectItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    projectMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    projectRole: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#e9ecef',
    },
    activeBadge: {
        backgroundColor: '#28a745',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
    },
}); 