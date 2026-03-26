import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { axiosClient } from "../utils/axios";
import { saveToken } from "../utils/auth";
import CustomButton from '../components/ui/CustomButton';
import CustomTextInput from '../components/ui/CustomTextInput';
import useStore from '../store/useStore';

function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.post('/auth/register', { name, email, password });
      await saveToken(response.data.token);
      await useStore.getState().checkAuth();
      navigation.reset({ index: 0, routes: [{ name: 'ModernHome' }] });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us and start exploring today.</Text>

        <CustomTextInput
          label="Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <CustomTextInput
          label="Email"
          placeholder="name@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomTextInput
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title="Sign Up"
          onPress={handleRegister}
          loading={loading}
        />

        <CustomButton
          variant="secondary"
          title="Already have an account? Log In"
          onPress={() => navigation.replace('Login')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    paddingBottom: 80, // optical centering
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 40,
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },

});

export default RegisterScreen;