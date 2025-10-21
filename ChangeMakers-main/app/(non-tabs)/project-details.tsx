import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Project } from '../lib/models';
import { projectService } from '../lib/project-service';
import { useAuth } from '../context/auth-context';
import { notificationService } from '../lib/notification-service';

const COLORS = {
    primary: '#007AFF',
    gray: {
        light: '#f8f9fa',
        medium: '#6c757d',
        dark: '#343a40'
    },
    white: '#FFFFFF',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
};

export default function ProjectDetailsScreen() {
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        if (projectId) {
            loadProjectDetails();
        }
    }, [projectId]);

    const loadProjectDetails = async () => {
        try {
            setLoading(true);
            const response = await projectService.getProject(projectId);
            const projectData = {
                projectId: response.$id,
                title: response.name,
                description: response.description,
                creatorId: response.creatorId,
                creatorName: response.creatorName,
                location: response.location,
                memberCount: response.memberCount || 0,
                progress: response.progress || 0,
                totalDonation: response.totalDonation || 0,
                volunteerRequired: response.volunteerRequired || false,
                completed: response.completed || false,
                category: response.category || [],
                createdAt: new Date(response.$createdAt),
                fundingRequired: response.fundingRequired || false,
                image: response.image || '',
                longitude: response.longitude,
                latitude: response.latitude,
            };
            setProject(projectData);

            // Load achievements
            const achievementsResponse = await projectService.getProjectAchievements(projectId);
            setAchievements(achievementsResponse.documents);

            // Load members
            const membersResponse = await projectService.getProjectMembers(projectId);
            setMembers(membersResponse.documents);
        } catch (error) {
            console.error('Error loading project details:', error);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const handleVolunteerRequest = async () => {
        if (!user || !project) return;

        try {
            await notificationService.sendVolunteerRequest(
                user.$id,
                project.creatorId,
                project.projectId,
                project.title
            );
            Alert.alert(
                'Request Sent',
                'Your volunteer request has been sent to the project admin.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error sending volunteer request:', error);
            Alert.alert(
                'Error',
                'Failed to send volunteer request. Please try again later.',
                [{ text: 'OK' }]
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !project) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'Project not found'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadProjectDetails}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Project Details',
                    headerShown: true,
                }}
            />
            <ScrollView style={styles.scrollView}>
                {project.project_image ? (
                    <Image
                        source={{ uri: project.project_image }}
                        style={styles.projectImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.projectImage, styles.placeholderImage]}>
                        <MaterialIcons name="image" size={40} color={COLORS.gray.medium} />
                    </View>
                )}

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{project.title}</Text>
                        <View style={styles.statusContainer}>
                            <Text style={[
                                styles.statusText,
                                project.completed ? styles.completedStatus : styles.activeStatus
                            ]}>
                                {project.completed ? 'Completed' : 'Active'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.creatorContainer}>
                        <MaterialIcons name="person" size={16} color={COLORS.gray.medium} />
                        <Text style={styles.creatorText}>Created by {project.creatorName}</Text>
                    </View>

                    <View style={styles.locationContainer}>
                        <MaterialIcons name="location-on" size={16} color={COLORS.gray.medium} />
                        <Text style={styles.locationText}>{project.location}</Text>
                    </View>

                    <Text style={styles.description}>{project.description}</Text>

                    <View style={styles.progressContainer}>
                        <Text style={styles.sectionTitle}>Progress</Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${project.progress}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{project.progress}%</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <Text style={styles.sectionTitle}>Project Stats</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <MaterialIcons name="people" size={24} color={COLORS.primary} />
                                <Text style={styles.statValue}>{project.memberCount}</Text>
                                <Text style={styles.statLabel}>Members</Text>
                            </View>
                            {project.fundingRequired && (
                                <View style={styles.statItem}>
                                    <MaterialIcons name="attach-money" size={24} color={COLORS.primary} />
                                    <Text style={styles.statValue}>${project.totalDonation}</Text>
                                    <Text style={styles.statLabel}>Raised</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.categoriesContainer}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <View style={styles.tagsContainer}>
                            {project.category.map((cat, index) => (
                                <View key={index} style={[styles.tag, styles.categoryTag]}>
                                    <Text style={styles.tagText}>{cat}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.achievementsContainer}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        {achievements.length > 0 ? (
                            achievements.map((achievement, index) => (
                                <View key={index} style={styles.achievementItem}>
                                    <MaterialIcons name="emoji-events" size={20} color={COLORS.warning} />
                                    <View style={styles.achievementContent}>
                                        <Text style={styles.achievementTitle}>{achievement.title}</Text>
                                        <Text style={styles.achievementDescription}>{achievement.description}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No achievements yet</Text>
                        )}
                    </View>

                    <View style={styles.membersContainer}>
                        <Text style={styles.sectionTitle}>Members</Text>
                        {members.length > 0 ? (
                            members.map((member, index) => (
                                <View key={index} style={styles.memberItem}>
                                    <View style={styles.memberAvatar}>
                                        <MaterialIcons name="person" size={24} color={COLORS.white} />
                                    </View>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <Text style={styles.memberRole}>{member.role}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No members yet</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {project.volunteerRequired && !project.completed && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.volunteerButton}
                        onPress={handleVolunteerRequest}
                    >
                        <MaterialIcons name="person-add" size={24} color={COLORS.white} />
                        <Text style={styles.volunteerButtonText}>Request to Volunteer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.gray.dark,
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    projectImage: {
        width: '100%',
        height: 250,
    },
    placeholderImage: {
        backgroundColor: COLORS.gray.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.gray.dark,
        flex: 1,
    },
    statusContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: COLORS.gray.light,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    completedStatus: {
        color: COLORS.success,
    },
    activeStatus: {
        color: COLORS.primary,
    },
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    creatorText: {
        fontSize: 14,
        color: COLORS.gray.medium,
        marginLeft: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 14,
        color: COLORS.gray.medium,
        marginLeft: 4,
    },
    description: {
        fontSize: 16,
        color: COLORS.gray.dark,
        lineHeight: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginBottom: 12,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.gray.light,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    progressText: {
        fontSize: 14,
        color: COLORS.gray.medium,
        textAlign: 'right',
    },
    statsContainer: {
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.gray.medium,
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryTag: {
        backgroundColor: COLORS.primary + '20',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    achievementsContainer: {
        marginBottom: 24,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.gray.light,
        borderRadius: 8,
        marginBottom: 8,
    },
    achievementContent: {
        flex: 1,
        marginLeft: 12,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray.dark,
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 14,
        color: COLORS.gray.medium,
    },
    membersContainer: {
        marginBottom: 24,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.gray.light,
        borderRadius: 8,
        marginBottom: 8,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInfo: {
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray.dark,
    },
    memberRole: {
        fontSize: 14,
        color: COLORS.gray.medium,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.gray.medium,
        textAlign: 'center',
        padding: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray.light,
    },
    volunteerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
    },
    volunteerButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 