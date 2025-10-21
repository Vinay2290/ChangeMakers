import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack, router } from 'expo-router';

const { width } = Dimensions.get('window');

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

interface Milestone {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
}

interface ProjectDetails {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    bannerImage: string;
    fundingGoal: number;
    fundingRaised: number;
    volunteersNeeded: number;
    volunteersCurrent: number;
    milestones: Milestone[];
    admin: {
        name: string;
        avatar: string;
        organization: string;
    };
}

// Dummy project data
const dummyProject: ProjectDetails = {
    id: '1',
    title: 'Environmental Cleanup Initiative',
    description: 'Join us in our mission to clean up local parks and beaches. We aim to remove 1000kg of waste and plant 500 trees in the next 6 months.',
    category: 'Environment',
    location: 'New York',
    bannerImage: 'https://picsum.photos/800/400',
    fundingGoal: 20000,
    fundingRaised: 15000,
    volunteersNeeded: 50,
    volunteersCurrent: 28,
    milestones: [
        {
            id: '1',
            title: 'Initial Cleanup Phase',
            description: 'Clean up 3 major parks in the city',
            status: 'completed',
            dueDate: '2024-03-15'
        },
        {
            id: '2',
            title: 'Tree Planting Campaign',
            description: 'Plant 200 trees in designated areas',
            status: 'in-progress',
            dueDate: '2024-04-30'
        },
        {
            id: '3',
            title: 'Community Education',
            description: 'Host 5 workshops on environmental conservation',
            status: 'pending',
            dueDate: '2024-06-15'
        }
    ],
    admin: {
        name: 'Sarah Johnson',
        avatar: 'https://picsum.photos/100/100',
        organization: 'Green Earth Foundation'
    }
};

const ProjectBanner = ({ project }: { project: ProjectDetails }) => (
    <View style={styles.bannerContainer}>
        <Image source={{ uri: project.bannerImage }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                    <MaterialIcons name="location-on" size={16} color="#fff" />
                    <Text style={styles.metaText}>{project.location}</Text>
                </View>
                <View style={styles.metaItem}>
                    <MaterialIcons name="category" size={16} color="#fff" />
                    <Text style={styles.metaText}>{project.category}</Text>
                </View>
            </View>
        </View>
    </View>
);

const AdminInfo = ({ admin }: { admin: ProjectDetails['admin'] }) => (
    <View style={styles.adminContainer}>
        <Image source={{ uri: admin.avatar }} style={styles.adminAvatar} />
        <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{admin.name}</Text>
            <Text style={styles.adminOrg}>{admin.organization}</Text>
        </View>
    </View>
);

const MembersSection = ({ project }: { project: ProjectDetails }) => (
    <TouchableOpacity
        style={styles.membersSection}
        onPress={() => router.push(`/project-members/${project.id}`)}
    >
        <View style={styles.membersHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
        <View style={styles.membersCount}>
            <Text style={styles.membersText}>
                {project.volunteersCurrent} members ({project.volunteersCurrent}/{project.volunteersNeeded} volunteers)
            </Text>
        </View>
    </TouchableOpacity>
);

const MilestoneTracker = ({ milestones }: { milestones: Milestone[] }) => (
    <View style={styles.milestonesContainer}>
        {milestones.map((milestone) => (
            <View key={milestone.id} style={styles.milestoneItem}>
                <View style={styles.milestoneHeader}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    <View style={[
                        styles.statusBadge,
                        milestone.status === 'completed' && styles.statusCompleted,
                        milestone.status === 'in-progress' && styles.statusInProgress
                    ]}>
                        <Text style={styles.statusText}>
                            {milestone.status.replace('-', ' ')}
                        </Text>
                    </View>
                </View>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                <Text style={styles.milestoneDate}>Due: {milestone.dueDate}</Text>
            </View>
        ))}
    </View>
);

const ActionButtons = ({ project }: { project: ProjectDetails }) => (
    <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="volunteer-activism" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>
                Volunteer ({project.volunteersCurrent}/{project.volunteersNeeded})
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="attach-money" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>
                Donate (${project.fundingRaised}/${project.fundingGoal})
            </Text>
        </TouchableOpacity>
    </View>
);

export default function ProjectDetailsScreen() {
    const params = useLocalSearchParams();
    const project = dummyProject; // In real app, fetch project based on params.id

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />
            <ScrollView style={styles.container}>
                <ProjectBanner project={project} />

                <View style={styles.content}>
                    {/* Description */}
                    <Text style={styles.sectionTitle}>About the Project</Text>
                    <Text style={styles.description}>{project.description}</Text>

                    {/* Milestones */}
                    <Text style={styles.sectionTitle}>Project Milestones</Text>
                    <MilestoneTracker milestones={project.milestones} />

                    {/* Members Section */}
                    <MembersSection project={project} />

                    {/* Action Buttons */}
                    <ActionButtons project={project} />

                    {/* Admin Info at bottom */}
                    <View style={styles.bottomSection}>
                        <Text style={styles.sectionTitle}>Project Admin</Text>
                        <AdminInfo admin={project.admin} />
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bannerContainer: {
        height: 250,
        width: width,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    projectTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    projectMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#fff',
        fontSize: 14,
    },
    content: {
        padding: 16,
    },
    adminContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    adminAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    adminInfo: {
        marginLeft: 12,
    },
    adminName: {
        fontSize: 16,
        fontWeight: '600',
    },
    adminOrg: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 24,
    },
    milestonesContainer: {
        marginBottom: 24,
    },
    milestoneItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    milestoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#e9ecef',
    },
    statusCompleted: {
        backgroundColor: '#28a745',
    },
    statusInProgress: {
        backgroundColor: '#ffc107',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
        textTransform: 'capitalize',
    },
    milestoneDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    milestoneDate: {
        fontSize: 12,
        color: '#999',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    membersSection: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    membersCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    membersText: {
        fontSize: 14,
        color: '#666',
    },
    bottomSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
}); 