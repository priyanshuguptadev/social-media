import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getToken, deleteToken } from '../utils/auth';
import { secureAxiosClient } from '../utils/axios';
import { getRelativeTime } from '../utils/time';
import AvatarCircle from '../components/AvatarCircle';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from '../utils/cloudinary';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isAuth, setIsAuth] = useState(null);
  const [profileData, setProfileData] = useState({ user: null, posts: [] });
  const [loading, setLoading] = useState(true);

  // Create Post Modal State
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAuthAndProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setIsAuth(false);
        setProfileData({ user: { name: 'Anonymous Visitor', username: 'guest' }, posts: [] });
        return;
      }

      const res = await secureAxiosClient.get('/auth/me');
      if (res.data && res.data.user) {
        setProfileData(res.data);
        setIsAuth(true);
      } else {
        setIsAuth(false);
        setProfileData({ user: { name: 'Anonymous Visitor', username: 'guest' }, posts: [] });
      }
    } catch (err) {
      console.log('Error fetching profile:', err);
      setIsAuth(false);
      setProfileData({ user: { name: 'Anonymous Visitor', username: 'guest' }, posts: [] });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAuthAndProfile();
    }, [])
  );

  const handleConfirmLogout = async () => {
    navigation.navigate("ConfirmLogoutModel", {
      onConfirm: async () => {
        await deleteToken();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
    });
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
      if (result.assets && result.assets.length > 0) {
        setNewPostImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !newPostImage.trim()) return;

    try {
      setIsSubmitting(true);
      let finalImageUrl = null;
      if (newPostImage) {
        finalImageUrl = await uploadImage(newPostImage);
        if (!finalImageUrl) {
          console.log('Failed to upload image securely');
          setIsSubmitting(false);
          return;
        }
      }

      const payload = { content: newPostText };
      if (finalImageUrl) {
        payload.image = finalImageUrl;
      }

      const res = await secureAxiosClient.post('/posts', payload);

      setProfileData(prev => ({
        ...prev,
        posts: [res.data, ...prev.posts]
      }));

      setNewPostText('');
      setNewPostImage('');
      setCreateModalVisible(false);
    } catch (err) {
      console.log('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isAuth || !profileData.user) return;
    const currentUser = profileData.user;

    setProfileData(prev => ({
      ...prev,
      posts: prev.posts.map(p => {
        if (p._id === postId) {
          const hasLiked = (p.likes || []).includes(currentUser.username);
          const newLikes = hasLiked
            ? p.likes.filter(u => u !== currentUser.username)
            : [...(p.likes || []), currentUser.username];
          return { ...p, likes: newLikes };
        }
        return p;
      })
    }));

    try {
      await secureAxiosClient.post(`/posts/${postId}/like`);
    } catch (err) {
      console.log('Error liking post:', err);
    }
  };

  if (isAuth === null || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#111111" />
      </View>
    );
  }

  const { user, posts } = profileData;
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

  const renderPostContent = ({ item }) => {
    const isLiked = isAuth ? (item.likes || []).includes(user.username) : false;
    const formattedPost = {
      ...item,
      id: item._id,
      text: item.content,
      image: item.image,
      user: {
        name: user.name,
        username: user.username,
      },
      likes: item.likes || [],
      likesCount: item.likes ? item.likes.length : 0,
      isLiked,
      comments: item.comments ? item.comments.length : 0,
      rawComments: item.comments || [],
      time: item.createdAt ? getRelativeTime(item.createdAt) : 'now',
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PostDetail', { post: formattedPost, currentUser: user })}
        style={styles.postContainer}
      >
        <View style={styles.postHeader}>
          <AvatarCircle username={user.username} size={44} />
          <View style={styles.postHeaderTextContainer}>
            <View style={styles.nameRow}>
              <View style={styles.nameColumn}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.userHandle} numberOfLines={1}>@{user.username}</Text>
              </View>
              <Text style={styles.timeText}>{formattedPost.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.postContent}>
          {item.content && <Text style={styles.postText}>{item.content}</Text>}
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={[styles.postImage, { marginTop: item.content ? 16 : 0 }]}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(formattedPost.id)}
            disabled={!isAuth}
          >
            <MaterialDesignIcons
              name={formattedPost.isLiked ? "heart" : "heart-outline"}
              size={18}
              color={formattedPost.isLiked ? "#FF3B30" : "#666666"}
            />
            <Text style={[styles.actionText, formattedPost.isLiked && { color: "#FF3B30" }]}>
              {formattedPost.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostDetail', { post: formattedPost, currentUser: user })}
          >
            <MaterialDesignIcons name="comment-outline" size={18} color="#666666" />
            <Text style={styles.actionText}>{item.comments ? item.comments.length : 0}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <AvatarCircle username={user.username} size={88} />
      <Text style={styles.profileName}>{user.name}</Text>
      <Text style={styles.profileHandle}>@{user.username}</Text>
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

      <View style={[styles.header, { paddingTop: insets.top || 44 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isAuth ? user.name : 'Profile'}</Text>
        {isAuth ? (
          <TouchableOpacity style={styles.logoutHeaderButton} onPress={handleConfirmLogout}>
            <Text style={{ color: "#111111" }}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

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

      {/* Create Post Full Screen Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalPostButton,
                (!newPostText.trim() && !newPostImage.trim()) && styles.modalPostButtonDisabled
              ]}
              onPress={handleCreatePost}
              disabled={(!newPostText.trim() && !newPostImage.trim()) || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalPostButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={styles.modalInputRow}>
              <AvatarCircle username={user?.username || 'guest'} size={40} />
              <TextInput
                style={styles.modalTextInput}
                placeholder="What's happening?"
                placeholderTextColor="#AAAAAA"
                multiline
                textAlignVertical="top"
                autoFocus
                value={newPostText}
                onChangeText={setNewPostText}
              />
            </View>

            {newPostImage ? (
              <View style={styles.modalImagePreviewContainer}>
                <Image source={{ uri: newPostImage }} style={styles.modalImagePreview} resizeMode="cover" />
                <TouchableOpacity style={styles.clearImageBtn} onPress={() => setNewPostImage('')}>
                  <MaterialDesignIcons name="close-circle" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.modalToolbar, { paddingBottom: insets.bottom || 16 }]}>
            <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
              <MaterialDesignIcons name="image-outline" size={24} color={newPostImage ? '#FF3B30' : '#888888'} />
            </TouchableOpacity>
            {newPostImage ? <Text style={styles.attachedText}>Attached Image</Text> : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerPlaceholder: {
    width: 40,
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
  postContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EAEAEA',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameColumn: {
    flex: 1,
    paddingRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.4,
  },
  userHandle: {
    fontSize: 14,
    color: '#888888',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  postContent: {
    marginBottom: 16,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#222222',
    letterSpacing: -0.3,
  },
  postImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#F7F7F8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalCancelButton: {
    padding: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#111111',
  },
  modalPostButton: {
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalPostButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
  modalPostButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    color: '#111111',
    lineHeight: 26,
    minHeight: 120,
    marginTop: Platform.OS === 'ios' ? 0 : -4,
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
  },
  modalImagePreviewContainer: {
    marginTop: 16,
    marginLeft: 52,
    position: 'relative',
  },
  modalImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F7F7F8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  clearImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  modalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
  },
  toolbarButton: {
    padding: 8,
  },
  attachedText: {
    marginLeft: 8,
    color: '#111111',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProfileScreen;
