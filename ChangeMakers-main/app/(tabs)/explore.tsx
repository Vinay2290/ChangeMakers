import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Project } from '../lib/models';
import { projectService } from '../lib/project-service';
import { useAuth } from '../context/auth-context';

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

export default function ExploreScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        loadProjects();
      }
    }
  }, [isAuthenticated, authLoading]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects(100, 0);
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
        image: doc.image || '',
        longitude: doc.longitude || 0,
        latitude: doc.latitude || 0
      }));
      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectPress = (project: Project) => {
    router.push({
      pathname: '/(non-tabs)/project-details',
      params: { projectId: project.projectId }
    });
  };

  const renderProjectCard = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => handleProjectPress(item)}
    >
      {item.project_image ? (
        <Image
          source={{ uri: item.project_image }}
          style={styles.projectImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.projectImage, styles.placeholderImage]}>
          <MaterialIcons name="image" size={40} color={COLORS.gray.medium} />
        </View>
      )}

      <View style={styles.projectContent}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              item.completed ? styles.completedStatus : styles.activeStatus
            ]}>
              {item.completed ? 'Completed' : 'Active'}
            </Text>
          </View>
        </View>

        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={16} color={COLORS.gray.medium} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.progress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="people" size={16} color={COLORS.gray.medium} />
            <Text style={styles.statText}>{item.memberCount} members</Text>
          </View>
          {item.fundingRequired && (
            <View style={styles.statItem}>
              <MaterialIcons name="attach-money" size={16} color={COLORS.gray.medium} />
              <Text style={styles.statText}>${item.totalDonation}</Text>
            </View>
          )}
        </View>

        <View style={styles.tagsContainer}>
          {item.volunteerRequired && (
            <View style={[styles.tag, styles.volunteerTag]}>
              <Text style={styles.tagText}>Volunteers Needed</Text>
            </View>
          )}
          {item.fundingRequired && (
            <View style={[styles.tag, styles.fundingTag]}>
              <Text style={styles.tagText}>Funding Required</Text>
            </View>
          )}
          {item.category.map((cat, index) => (
            <View key={index} style={[styles.tag, styles.categoryTag]}>
              <Text style={styles.tagText}>{cat}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProjects}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Explore Projects',
          headerShown: true,
        }}
      />
      <FlatList
        data={projects}
        renderItem={renderProjectCard}
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
  list: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: COLORS.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectContent: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
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
  projectDescription: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray.medium,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginLeft: 4,
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
  volunteerTag: {
    backgroundColor: COLORS.warning + '20',
  },
  fundingTag: {
    backgroundColor: COLORS.success + '20',
  },
  categoryTag: {
    backgroundColor: COLORS.primary + '20',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray.medium,
    marginTop: 20,
  },
});
