import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { donationService } from '../lib/donation-service';
import { Donation } from '../lib/models';

export default function UserDonationsScreen() {
    const { userId } = useLocalSearchParams();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDonations();
    }, [userId]);

    const loadDonations = async () => {
        try {
            const response = await donationService.getUserDonations(userId as string);
            setDonations(response.documents);
        } catch (error) {
            console.error('Error loading donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderDonation = ({ item }: { item: Donation }) => (
        <TouchableOpacity
            style={styles.donationCard}
            onPress={() => router.push(`/project/${item.projectId}`)}
        >
            <View style={styles.donationContent}>
                <Text style={styles.projectTitle}>{item.projectTitle}</Text>
                <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                <Text style={styles.date}>
                    Donated on {new Date(item.donatedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.status}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={donations}
                renderItem={renderDonation}
                keyExtractor={item => item.donationId}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No donations found</Text>
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
    donationCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    donationContent: {
        padding: 16,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    amount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    status: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
}); 