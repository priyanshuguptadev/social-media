import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation } from '@react-navigation/native';
import { secureAxiosClient } from '../utils/axios';
import { getRelativeTime } from '../utils/time';
import AvatarCircle from '../components/AvatarCircle';
import PostCard from '../components/PostCard';
import ScreenHeader from '../components/ui/ScreenHeader';
import CreatePostModal from '../components/features/CreatePostModal';
import useStore from '../store/useStore';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const isAuth = useStore(state => state.isAuth);
  const user = useStore(state => state.user);
  const posts = useStore(state => state.profilePosts);
  const loading = useStore(state => state.isLoadingAuth);
  const checkAuth = useStore(state => state.checkAuth);
  const likePost = useStore(state => state.likePost);
  const logout = useStore(state => state.logout);
  const addPost = useStore(state => state.addPost);

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const handleConfirmLogout = async () => {
    navigation.navigate("ConfirmLogoutModal", {
      onConfirm: async () => {
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
    });
  };

  const handlePostCreated = (newPost) => {
    addPost(newPost);
  };

  const handleLike = (postId) => {
    likePost(postId);
  };

  if (isAuth === null || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#111111" />
      </View>
    );
  }


  const displayUser = user || { name: 'Anonymous Visitor', username: 'guest' };
  const joinedDate = displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

  const renderPostContent = ({ item }) => {
    const isLiked = (isAuth && user) ? (item.likes || []).includes(user.username) : false;
    const formattedPost = {
      ...item,
      id: item._id,
      text: item.content,
      image: item.image,
      user: {
        name: displayUser.name,
        username: displayUser.username,
      },
      likes: item.likes || [],
      likesCount: item.likes ? item.likes.length : 0,
      isLiked,
      comments: item.comments ? item.comments.length : 0,
      rawComments: item.comments || [],
      time: item.createdAt ? getRelativeTime(item.createdAt) : 'now',
    };

    return <PostCard post={formattedPost} currentUser={isAuth ? user : null} onLike={handleLike} />;
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <AvatarCircle username={displayUser.username} size={88} />
      <Text style={styles.profileName}>{displayUser.name}</Text>
      <Text style={styles.profileHandle}>@{displayUser.username}</Text>
      {joinedDate && (
        <View style={styles.joinDateContainer}>
          <MaterialDesignIcons name="calendar-blank" size={16} color="#888888" />
          <Text style={styles.joinDateText}>Joined {joinedDate}</Text>
        </View>
      )}
      <View style={styles.divider} />
    </View>
  );

  const renderUnauthButtons = () => (
    <View style={styles.unauthButtonsContainer}>
      <Text style={styles.unauthMessage}>Sign in to interact with posts and view your personal timeline.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.primaryButtonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.secondaryButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title={isAuth ? user?.name : 'Profile'}
        showBackButton={true}
        rightComponent={isAuth ? (
          <TouchableOpacity style={styles.logoutHeaderButton} onPress={handleConfirmLogout}>
            <Text style={{ color: "#111111" }}>Logout</Text>
          </TouchableOpacity>
        ) : null}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderProfileHeader}
        renderItem={renderPostContent}
        ListEmptyComponent={!isAuth ? renderUnauthButtons : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isAuth && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() => setCreateModalVisible(true)}
        >
          <MaterialDesignIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <CreatePostModal
        isVisible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onPostCreated={handlePostCreated}
        currentUser={user}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  logoutHeaderButton: {
    padding: 8,
    marginRight: -8,
  },
  unauthButtonsContainer: {
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  unauthMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#111111',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F7F7F8',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: '#888888',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  joinDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  joinDateText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#888888',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EAEAEA',
    marginHorizontal: -20,
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

});

export default ProfileScreen;
