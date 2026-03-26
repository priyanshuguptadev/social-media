import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { secureAxiosClient } from '../utils/axios';
import { getToken } from '../utils/auth';
import { getRelativeTime } from '../utils/time';
import AvatarCircle from '../components/AvatarCircle';
import PostCard from '../components/PostCard';
import ScreenHeader from '../components/ui/ScreenHeader';

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

  const renderItem = ({ item }) => {
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

    return <PostCard post={formattedPost} currentUser={currentUser} onLike={handleLike} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <ScreenHeader 
        title="Feed"
        leftComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ borderColor: '#111111', borderWidth: 2, borderRadius: "50%" }}>
            <AvatarCircle username={currentUser ? currentUser.username : 'guest'} size={36} />
          </TouchableOpacity>
        }
      />

      {/* Feed List */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#111111" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
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

  listContent: {
    paddingBottom: 40,
  },
});

export default ModernHomeScreen;
