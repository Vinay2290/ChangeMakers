import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import { useAuth } from '../context/auth-context';
import { userService } from '../lib/user-service';
import { account, User } from '../lib/appwrite';
import { Project, Post } from '../lib/models';

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

const ProfileHeader: React.FC<{ user: User }> = ({ user }) => {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.avatar || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <TouchableOpacity
          style={styles.changeAvatarButton}
          onPress={handleEditProfile}
        >
          <MaterialIcons name="camera-alt" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.location}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          {user.locationName || 'Location not set'}
        </Text>
        <Text style={styles.bio}>{user.bio || 'No bio available'}</Text>
      </View>
    </View>
  );
};

const ScoreCard: React.FC<{ title: string; score: number; icon: string }> = ({ title, score, icon }) => (
  <View style={styles.scoreCard}>
    <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={24} color={COLORS.primary} />
    <Text style={styles.scoreTitle}>{title}</Text>
    <Text style={styles.scoreValue}>{score}</Text>
  </View>
);

const SectionHeader: React.FC<{ title: string; action?: string }> = ({ title, action }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <TouchableOpacity
    style={styles.projectCard}
    onPress={() => router.push(`/project-details?id=${project.projectId}`)}
  >
    <View style={styles.projectHeader}>
      <Text style={styles.projectTitle}>{project.title}</Text>
      <View style={styles.roleTag}>
        <Text style={styles.roleText}>MEMBER</Text>
      </View>
    </View>
    <Text style={styles.projectLocation}>{project.location}</Text>
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { width: `${project.progress}%` }]} />
      <Text style={styles.progressText}>{project.progress}% Complete</Text>
    </View>
  </TouchableOpacity>
);

const PostCard: React.FC<{ post: Post }> = ({ post }) => (
  <View key={post.postId} style={styles.postItem}>
    <Text style={styles.postTitle}>{post.title}</Text>
    <Text style={styles.postContent} numberOfLines={2}>{post.description}</Text>
    <View style={styles.postMeta}>
      <View style={styles.postStat}>
        <MaterialIcons name="thumb-up" size={16} color="#666" />
        <Text style={styles.postStatText}>{post.likes}</Text>
      </View>
      <View style={styles.postStat}>
        <MaterialIcons name="chat" size={16} color="#666" />
        <Text style={styles.postStatText}>{post.comments}</Text>
      </View>
      <Text style={styles.postDate}>{new Date(post.postedAt).toLocaleDateString()}</Text>
    </View>
  </View>
);

const ProjectsSection = ({ projects, onViewAll }: { projects: Project[], onViewAll: () => void }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Projects</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
    {projects.map(project => (
      <ProjectCard key={project.projectId} project={project} />
    ))}
  </View>
);

const PostsSection = ({ posts, onViewAll }: { posts: Post[], onViewAll: () => void }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Posts</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
    {posts?.map(post => (
      <PostCard key={post.postId} post={post} />
    ))}
  </View>
);

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentAccount = await account.get();
        const userData = await userService.getUserProfile(currentAccount.$id);
        setUser({
          ...userData,
          username: userData.username || '',
          email: userData.email || ''
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.replace('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.container}>
        <ProfileHeader user={user} />

        {/* Scores Section */}
        <View style={styles.scoresContainer}>
          <ScoreCard
            title="Trust Score"
            score={user.trustScore || 0}
            icon="thumb-up"
          />
          <ScoreCard
            title="Impact Score"
            score={user.impactScore || 0}
            icon="star"
          />
        </View>

        {/* Achievements Section
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
          </View>
          {(user.achievements?.length ?? 0) > 0 ? (
            user.achievements?.map((achievement) => (
              <View key={achievement.achievementId} style={styles.achievementItem}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No achievements yet</Text>
          )}
        </View> */}

        {/* Projects Section */}
        <ProjectsSection
          projects={user.memberProjects?.map(project => ({
            projectId: project.projectId,
            title: project.title,
            description: project.description,
            location: project.location,
            creatorId: user.userId,
            creatorName: user.username,
            createdAt: new Date(),
            progress: project.progress,
            memberCount: 0,
            totalDonation: 0,
            volunteerRequired: false,
            completed: false,
            category: [],
            fundingRequired: false,
            longitude: project.longitude,
            latitude: project.latitude
          })) || []}
          onViewAll={() => router.push(`/user-projects?userId=${user.userId}`)}
        />

        {/* Posts Section */}
        <PostsSection
          posts={user.posts?.map(post => ({
            postId: post.postId,
            title: post.title,
            description: post.description,
            location: post.location || '',
            likes: post.likes,
            comments: post.comments,
            postedAt: new Date(post.postedAt),
            authorName: user.username,
            authorId: post.authorId
          })) || []}
          onViewAll={() => router.push(`/user-posts?userId=${user.userId}`)}
        />

        {/* Donations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Donations</Text>
            <TouchableOpacity onPress={() => router.push(`/user-donations?userId=${user.userId}`)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {(user.donations?.length ?? 0) > 0 ? (
            user.donations?.map((donation) => (
              <View key={donation.projectId} style={styles.donationItem}>
                <Text style={styles.donationAmount}>${donation.amount}</Text>
                <Text style={styles.donationProject}>{donation.projectTitle}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No donations yet</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/edit-profile')}
          >
            <MaterialIcons name="edit" size={24} color={COLORS.primary} />
            <Text style={[styles.actionText, { color: COLORS.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.alert} />
            <Text style={[styles.actionText, { color: COLORS.alert }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.gray.light,
  },
  headerBar: {
    height: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray.dark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray.light,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray.dark,
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: COLORS.gray.dark,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  interestTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  interestText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  scoresContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreTitle: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginVertical: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray.dark,
  },
  section: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray.dark,
  },
  sectionAction: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray.dark,
    flex: 1,
  },
  roleTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  projectLocation: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray.medium,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: COLORS.gray.dark,
    marginTop: 4,
  },
  editProfileButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  editProfileText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  postItem: {
    backgroundColor: COLORS.gray.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.gray.dark,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginBottom: 12,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginLeft: 4,
  },
  postDate: {
    fontSize: 12,
    color: COLORS.gray.medium,
  },
  achievementItem: {
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.gray.dark,
  },
  donationItem: {
    marginBottom: 12,
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  donationProject: {
    fontSize: 14,
    color: COLORS.gray.dark,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray.medium,
    textAlign: 'center',
  },
  error: {
    color: COLORS.alert,
    fontSize: 16,
    textAlign: 'center',
  },
}); 