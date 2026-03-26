import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation } from '@react-navigation/native';
import AvatarCircle from './AvatarCircle';

const PostCard = ({ post, currentUser, onLike, disableNavigation }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={disableNavigation ? undefined : () => navigation.navigate('PostDetail', { post, currentUser })}
      disabled={disableNavigation}
      style={styles.postContainer}
    >
      <View style={styles.postHeader}>
        <AvatarCircle username={post.user.username} size={44} />
        <View style={styles.postHeaderTextContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameColumn}>
              <Text style={styles.userName} numberOfLines={1}>{post.user.name}</Text>
              <Text style={styles.userHandle} numberOfLines={1}>@{post.user.username}</Text>
            </View>
            <Text style={styles.timeText}>{post.time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.postContent}>
        {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            style={[styles.postImage, { marginTop: post.text ? 16 : 0 }]}
            resizeMode="cover"
          />
        ) : null}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
          disabled={!currentUser}
        >
          <MaterialDesignIcons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={18}
            color={post.isLiked ? "#FF3B30" : "#666666"}
          />
          <Text style={[styles.actionText, post.isLiked && { color: "#FF3B30" }]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            if (!disableNavigation) {
              e.stopPropagation();
              navigation.navigate('PostDetail', { post, currentUser });
            }
          }}
          disabled={disableNavigation}
        >
          <MaterialDesignIcons name="comment-outline" size={18} color="#666666" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default PostCard;
