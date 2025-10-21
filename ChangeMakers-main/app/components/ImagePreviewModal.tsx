import React, { useState, useEffect } from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
    primary: '#007BFF',
    white: '#FFFFFF',
    gray: {
        dark: '#343a40',
        medium: '#6c757d',
    },
    background: 'rgba(0, 0, 0, 0.5)',
};

interface ImagePreviewModalProps {
    visible: boolean;
    imageUri: string;
    onConfirm: () => void;
    onCancel: () => void;
    isUploading: boolean;
}

export default function ImagePreviewModal({
    visible,
    imageUri,
    onConfirm,
    onCancel,
    isUploading,
}: ImagePreviewModalProps) {
    const [progress] = useState(new Animated.Value(0));

    useEffect(() => {
        if (isUploading) {
            Animated.timing(progress, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: false,
            }).start();
        } else {
            progress.setValue(0);
        }
    }, [isUploading]);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.preview}
                        resizeMode="contain"
                    />
                    {isUploading && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                            </View>
                            <Text style={styles.progressText}>Uploading...</Text>
                        </View>
                    )}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            disabled={isUploading}
                        >
                            <MaterialIcons name="close" size={24} color={COLORS.gray.dark} />
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <>
                                    <MaterialIcons name="check" size={24} color={COLORS.white} />
                                    <Text style={[styles.buttonText, styles.confirmText]}>Confirm</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    preview: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 20,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmText: {
        color: COLORS.white,
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    progressText: {
        textAlign: 'center',
        color: COLORS.gray.medium,
        marginTop: 8,
        fontSize: 14,
    },
}); 