import { create } from 'zustand';
import { secureAxiosClient } from '../utils/axios';
import { getToken, deleteToken } from '../utils/auth';

const useStore = create((set, get) => ({
  user: null,
  isAuth: null,
  feedPosts: [],
  profilePosts: [],
  isLoadingAuth: true,
  isLoadingFeed: true,

  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const token = await getToken();
      if (!token) {
        set({ isAuth: false, user: null, profilePosts: [], isLoadingAuth: false });
        return;
      }
      const res = await secureAxiosClient.get('/auth/me');
      if (res.data && res.data.user) {
        set({ isAuth: true, user: res.data.user, profilePosts: res.data.posts || [] });
      } else {
        set({ isAuth: false, user: null, profilePosts: [] });
      }
    } catch (err) {
      console.log('Error fetching auth:', err);
      set({ isAuth: false, user: null, profilePosts: [] });
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  fetchFeed: async () => {
    set({ isLoadingFeed: true });
    try {
      const res = await secureAxiosClient.get('/posts');
      set({ feedPosts: res.data });
    } catch (err) {
      console.log('Error fetching feed:', err);
    } finally {
      set({ isLoadingFeed: false });
    }
  },

  addPost: (newPost) => {
    set((state) => {
      const populatedPost = { ...newPost };
      if (!populatedPost.user || typeof populatedPost.user === 'string') {
        populatedPost.user = {
          _id: state.user?._id || populatedPost.user,
          username: state.user?.username || 'unknown',
          name: state.user?.name || 'Unknown'
        };
      }
      return {
        feedPosts: [populatedPost, ...state.feedPosts],
        profilePosts: [populatedPost, ...state.profilePosts],
      };
    });
  },

  incrementCommentCount: (postId) => {
    const updatePostsArray = (posts) => posts.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), { _id: 'temp_' + Date.now() }]
        };
      }
      return p;
    });

    set((state) => ({
      feedPosts: updatePostsArray(state.feedPosts),
      profilePosts: updatePostsArray(state.profilePosts),
    }));
  },

  likePost: async (postId) => {
    const { user, isAuth } = get();
    if (!isAuth || !user) return;

    // Optimistically update both arrays
    const updatePostsArray = (posts) => posts.map(p => {
      if (p._id === postId) {
        const hasLiked = (p.likes || []).includes(user.username);
        const newLikes = hasLiked
          ? p.likes.filter(u => u !== user.username)
          : [...(p.likes || []), user.username];
        return { ...p, likes: newLikes };
      }
      return p;
    });

    set((state) => ({
      feedPosts: updatePostsArray(state.feedPosts),
      profilePosts: updatePostsArray(state.profilePosts),
    }));

    try {
      await secureAxiosClient.post(`/posts/${postId}/like`);
    } catch (err) {
      console.log('Error liking post sync:', err);
      // Revert optimistic update could be implemented here
    }
  },

  logout: async () => {
    await deleteToken();
    set({
      isAuth: false,
      user: null,
      profilePosts: [],
    });
  }
}));

export default useStore;
