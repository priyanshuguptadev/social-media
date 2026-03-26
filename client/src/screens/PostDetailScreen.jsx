import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useFocusEffect } from '@react-navigation/native';
import { secureAxiosClient } from '../utils/axios';
import { getRelativeTime } from '../utils/time';
import AvatarCircle from '../components/AvatarCircle';

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
    try {
      await secureAxiosClient.post(`/posts/${post.id}/like`);
    } catch (err) {
      console.log('Error liking post:', err);
    }
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
    } catch (err) {
      console.log('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostContent = () => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <AvatarCircle username={post.user?.username} size={44} />
        <View style={styles.postHeaderTextContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameColumn}>
              <Text style={styles.userName} numberOfLines={1}>{post.user?.name || 'Unknown'}</Text>
              <Text style={styles.userHandle} numberOfLines={1}>@{post.user?.username || 'unknown'}</Text>
            </View>
            <Text style={styles.timeText}>{post.time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.postContent}>
        {post.text && <Text style={styles.postText}>{post.text}</Text>}
        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={[styles.postImage, { marginTop: post.text ? 16 : 0 }]}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
           style={styles.actionButton} 
           onPress={handleLike}
           disabled={!currentUser}
        >
          <MaterialDesignIcons 
             name={post.isLiked ? "heart" : "heart-outline"} 
             size={18} 
             color={post.isLiked ? "#FF3B30" : "#666666"} 
          />
          <Text style={[styles.actionText, post.isLiked && { color: "#FF3B30" }]}>
             {post.likesCount !== undefined ? post.likesCount : post.likes}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionButton}>
          <MaterialDesignIcons name="comment-outline" size={18} color="#666666" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );

  const renderComment = ({ item }) => {
    const isPopulated = typeof item.user === 'object' && item.user !== null;
    const commentUsername = isPopulated ? item.user.username : 'guest';
    const commentName = isPopulated ? item.user.name : 'Anonymous';
    const timeDisplay = item.createdAt ? getRelativeTime(item.createdAt) : 'now';

    return (
      <View style={styles.commentContainer}>
        <AvatarCircle username={commentUsername} size={36} />
        <View style={styles.commentContent}>
          <View style={styles.commentNameRow}>
            <View style={styles.nameColumn}>
               <Text style={styles.commentUserName} numberOfLines={1}>{commentName}</Text>
               {isPopulated && <Text style={styles.commentUserHandle} numberOfLines={1}>@{commentUsername}</Text>}
            </View>
            <Text style={styles.timeText}>{timeDisplay}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top || 44 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.headerPlaceholder} />
      </View>

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
          renderItem={renderComment}
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4, 
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 20,
  },
  postText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#111111',
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
    marginBottom: 16,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EAEAEA',
    marginHorizontal: -20,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  commentUserHandle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
    flexShrink: 1,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    letterSpacing: -0.2,
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
