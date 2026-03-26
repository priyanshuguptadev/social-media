import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useFocusEffect } from '@react-navigation/native';
import { secureAxiosClient } from '../utils/axios';
import { getRelativeTime } from '../utils/time';
import AvatarCircle from '../components/AvatarCircle';
import PostCard from '../components/PostCard';
import ScreenHeader from '../components/ui/ScreenHeader';
import CommentItem from '../components/features/CommentItem';
import useStore from '../store/useStore';

const PostDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { post: initialPost, currentUser } = route.params;

  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const res = await secureAxiosClient.get(`/posts/${initialPost.id}`);
      if (res.data) {
        const postData = res.data;
        const rawLikes = postData.likes || [];
        const isLiked = currentUser ? rawLikes.includes(currentUser.username) : false;
        
        setPost({
          id: postData._id,
          text: postData.content,
          image: postData.image,
          user: {
            name: postData.user?.name || 'Unknown',
            username: postData.user?.username || 'unknown',
          },
          likesCount: rawLikes.length,
          rawLikes,
          isLiked,
          comments: postData.comments ? postData.comments.length : 0,
          rawComments: postData.comments || [],
          time: postData.createdAt ? getRelativeTime(postData.createdAt) : 'now',
        });
      }
    } catch (err) {
      console.log('Error fetching post details:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPostDetails();
    }, [initialPost.id])
  );

  const likePost = useStore(state => state.likePost);
  const incrementCommentCount = useStore(state => state.incrementCommentCount);

  const handleLike = async () => {
    if (!currentUser) return;
    setPost(prev => {
      const hasLiked = prev.rawLikes.includes(currentUser.username);
      const newLikes = hasLiked
        ? prev.rawLikes.filter(u => u !== currentUser.username)
        : [...prev.rawLikes, currentUser.username];
        
      return { 
        ...prev, 
        rawLikes: newLikes,
        likesCount: newLikes.length,
        isLiked: !hasLiked 
      };
    });
    
    // Update global store
    likePost(post.id);
  };

  const handleComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await secureAxiosClient.post(`/posts/${post.id}/comment`, {
        content: commentText
      });
      fetchPostDetails();
      setCommentText('');
      incrementCommentCount(post.id);
    } catch (err) {
      console.log('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostContent = () => (
    <View>
      <PostCard post={post} currentUser={currentUser} onLike={handleLike} disableNavigation={true} />
      <View style={styles.divider} />
    </View>
  );



  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <ScreenHeader title="Post" showBackButton={true} />

      {/* Content Rendering */}
      {loading && (!post.rawComments || post.rawComments.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111111" />
        </View>
      ) : (
        <FlatList
          data={post.rawComments || []}
          keyExtractor={(item) => item._id || Math.random().toString()}
          ListHeaderComponent={renderPostContent}
          renderItem={({ item }) => <CommentItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      )}

      {/* Comment Input */}
      {currentUser && (
        <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom || 16 }]}>
          <AvatarCircle username={currentUser.username} size={36} />
          <TextInput
            style={styles.commentInput}
            placeholder="Post a reply"
            placeholderTextColor="#AAAAAA"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={280}
          />
          <TouchableOpacity 
             style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
             onPress={handleComment}
             disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.sendButtonText, !commentText.trim() && styles.sendButtonTextDisabled]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EAEAEA',
    marginHorizontal: -20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: '#F7F7F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 40,
    color: '#111111',
  },
  sendButton: {
    backgroundColor: '#111111',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  sendButtonTextDisabled: {
    color: '#BFBFBF',
  },
});

export default PostDetailScreen;
