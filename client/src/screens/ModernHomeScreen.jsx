import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { secureAxiosClient } from '../utils/axios';
import { getToken } from '../utils/auth';
import { getRelativeTime } from '../utils/time';
import AvatarCircle from '../components/AvatarCircle';

const ModernHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedData = async () => {
    try {
      const token = await getToken();
      if (token) {
        const resUser = await secureAxiosClient.get('/auth/me');
        if (resUser.data && resUser.data.user) {
          setCurrentUser(resUser.data.user);
        }
      } else {
        setCurrentUser(null);
      }

      const resPosts = await secureAxiosClient.get('/posts');
      setPosts(resPosts.data);
    } catch (err) {
      console.log('Feed Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFeedData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeedData();
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    setPosts(prevPosts => prevPosts.map(p => {
      if (p._id === postId) {
        const hasLiked = (p.likes || []).includes(currentUser.username);
        const newLikes = hasLiked
          ? p.likes.filter(u => u !== currentUser.username)
          : [...(p.likes || []), currentUser.username];
        return { ...p, likes: newLikes };
      }
      return p;
    }));
    try {
      await secureAxiosClient.post(`/posts/${postId}/like`);
    } catch (err) {
      console.log('Error liking post:', err);
    }
  };

  const renderPost = ({ item }) => {
    const isLiked = currentUser ? (item.likes || []).includes(currentUser.username) : false;
    const formattedPost = {
      ...item,
      id: item._id,
      text: item.content,
      image: item.image,
      user: {
        name: item.user?.name || 'Unknown',
        username: item.user?.username || 'unknown',
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
        onPress={() => navigation.navigate('PostDetail', { post: formattedPost, currentUser })}
        style={styles.postContainer}
      >
        <View style={styles.postHeader}>
          <AvatarCircle username={formattedPost.user.username} size={44} />
          <View style={styles.postHeaderTextContainer}>
            <View style={styles.nameRow}>
              <View style={styles.nameColumn}>
                <Text style={styles.userName} numberOfLines={1}>{formattedPost.user.name}</Text>
                <Text style={styles.userHandle} numberOfLines={1}>@{formattedPost.user.username}</Text>
              </View>
              <Text style={styles.timeText}>{formattedPost.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.postContent}>
          {formattedPost.text ? <Text style={styles.postText}>{formattedPost.text}</Text> : null}
          {formattedPost.image ? (
            <Image
              source={{ uri: formattedPost.image }}
              style={[styles.postImage, { marginTop: formattedPost.text ? 16 : 0 }]}
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(formattedPost.id)}
            disabled={!currentUser}
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
            onPress={() => navigation.navigate('PostDetail', { post: formattedPost, currentUser })}
          >
            <MaterialDesignIcons name="comment-outline" size={18} color="#666666" />
            <Text style={styles.actionText}>{formattedPost.comments}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top || 44 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ borderColor: '#111111', borderWidth: 2, borderRadius: "50%" }}>
          <AvatarCircle username={currentUser ? currentUser.username : 'guest'} size={36} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feed</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Feed List */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#111111" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#888', fontSize: 16 }}>No posts found.</Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 36,
  },
  listContent: {
    paddingBottom: 40,
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
    height: 300,
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
});

export default ModernHomeScreen;
