import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ConfirmLogoutModal = ({ navigation, route }) => {
    const { onConfirm } = route.params || {};

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        navigation.goBack();
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.content}>
                <Text style={styles.title}>Log Out</Text>
                <Text style={styles.text}>Are you sure you want to log out?</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmText}>Yes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111111',
        marginBottom: 8,
    },
    text: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F7F7F8',
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#111111',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111111',
    },
});

export default ConfirmLogoutModal;