import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRelativeTime } from '../../utils/time';
import AvatarCircle from '../AvatarCircle';

const CommentItem = ({ item }) => {
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

const styles = StyleSheet.create({
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
  nameColumn: {
    flex: 1,
    paddingRight: 8,
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
  timeText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    letterSpacing: -0.2,
  },
});

export default CommentItem;
