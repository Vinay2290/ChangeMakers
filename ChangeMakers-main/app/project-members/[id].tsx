import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Member {
    id: string;
    name: string;
    avatar: string;
    role: 'admin' | 'volunteer';
    joinDate: string;
}

// Dummy data for members
const MEMBERS: Member[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://picsum.photos/100/100',
        role: 'admin',
        joinDate: '2024-01-15'
    },
    {
        id: '2',
        name: 'Michael Chen',
        avatar: 'https://picsum.photos/100/101',
        role: 'volunteer',
        joinDate: '2024-02-01'
    },
    {
        id: '3',
        name: 'Emma Wilson',
        avatar: 'https://picsum.photos/100/102',
        role: 'volunteer',
        joinDate: '2024-02-15'
    },
    {
        id: '4',
        name: 'David Brown',
        avatar: 'https://picsum.photos/100/103',
        role: 'volunteer',
        joinDate: '2024-03-01'
    }
];

const MemberItem = ({ member }: { member: Member }) => (
    <TouchableOpacity
        style={styles.memberItem}
        onPress={() => router.push(`/user-profile/${member.id}`)}
    >
        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
        <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <View style={styles.memberMeta}>
                <View style={[
                    styles.roleBadge,
                    member.role === 'admin' && styles.adminBadge
                ]}>
                    <Text style={styles.roleText}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Text>
                </View>
                <Text style={styles.joinDate}>Joined {member.joinDate}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function ProjectMembersScreen() {
    const { id } = useLocalSearchParams();

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Project Members',
                    headerBackTitle: 'Back'
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={MEMBERS}
                    renderItem={({ item }) => <MemberItem member={item} />}
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
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 12,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#e9ecef',
    },
    adminBadge: {
        backgroundColor: '#007AFF',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
    },
    joinDate: {
        fontSize: 12,
        color: '#666',
    },
}); 