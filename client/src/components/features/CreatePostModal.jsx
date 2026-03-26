import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from '../../utils/cloudinary';
import { secureAxiosClient } from '../../utils/axios';
import AvatarCircle from '../AvatarCircle';

const CreatePostModal = ({ isVisible, onClose, onPostCreated, currentUser }) => {
  const insets = useSafeAreaInsets();
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      onPostCreated(res.data);
      
      setNewPostText('');
      setNewPostImage('');
      onClose();
    } catch (err) {
      console.log('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
            <TouchableOpacity onPress={onClose} style={styles.modalCancelButton}>
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
              <AvatarCircle username={currentUser?.username || 'guest'} size={40} />
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
  );
};

const styles = StyleSheet.create({
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

export default CreatePostModal;
