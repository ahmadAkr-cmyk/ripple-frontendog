import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== MOCK DATA (remove when backend is ready) ==========
const MOCK_ENABLED = true;

const mockUser = { _id: 'u1', name: 'Ali Khan', email: 'ali@example.com', createdAt: '2025-01-15', friends: ['u2', 'u3'] };
const mockUsers = [
  mockUser,
  { _id: 'u2', name: 'Sara Ahmed', email: 'sara@example.com', createdAt: '2025-02-10', friends: ['u1'] },
  { _id: 'u3', name: 'Bilal Sheikh', email: 'bilal@example.com', createdAt: '2025-03-01', friends: ['u1'] },
  { _id: 'u4', name: 'Hina Raza', email: 'hina@example.com', createdAt: '2025-04-20', friends: [] },
];

const mockPosts = [
  { _id: 'p1', user: mockUsers[1], text: 'Beautiful sunset today! 🌅 Loving the vibes.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', likes: ['u1'], comments: [{ user: mockUsers[2], text: 'Amazing shot! 📸', createdAt: new Date() }], createdAt: new Date(Date.now() - 3600000) },
  { _id: 'p2', user: mockUsers[2], text: 'Just shipped a new feature at work! Feels great to see it live. 🚀', likes: ['u2'], comments: [], createdAt: new Date(Date.now() - 7200000) },
  { _id: 'p3', user: mockUser, text: 'Coffee and code — the perfect combo ☕💻', likes: ['u2', 'u3'], comments: [{ user: mockUsers[1], text: 'So true! 😄', createdAt: new Date() }], createdAt: new Date(Date.now() - 86400000) },
  { _id: 'p4', user: mockUsers[3], text: 'Exploring new hiking trails this weekend 🏔️', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600', likes: [], comments: [], createdAt: new Date(Date.now() - 172800000) },
];

let mockMessages = [
  { _id: 'm1', from: 'u2', to: 'u1', text: 'Hey! How are you?', createdAt: new Date(Date.now() - 3600000) },
  { _id: 'm2', from: 'u1', to: 'u2', text: "I'm good, thanks! Working on a project.", createdAt: new Date(Date.now() - 3500000) },
  { _id: 'm3', from: 'u2', to: 'u1', text: 'Nice! Let me know if you need help 🙌', createdAt: new Date(Date.now() - 3400000) },
];

const mockFriendRequests = [
  { _id: 'fr1', from: mockUsers[3], createdAt: new Date() },
];

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

const mock = (data) => delay().then(() => ({ data }));

// ========== AUTH ==========
export const login = (data) => {
  if (MOCK_ENABLED) return mock({ user: mockUser, token: 'mock-token-12345' });
  return API.post('/api/auth/login', data); // FILL THIS: /api/auth/login
};
export const register = (data) => {
  if (MOCK_ENABLED) {
    const newUser = { ...mockUser, name: data.name || mockUser.name, email: data.email || mockUser.email };
    return mock({ user: newUser, token: 'mock-token-12345' });
  }
  return API.post('/api/auth/register', data); // FILL THIS: /api/auth/register
};

// ========== USERS ==========
export const searchUsers = (query) => {
  if (MOCK_ENABLED) return mock(mockUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase())));
  return API.get(`/api/users/search?q=${query}`); // FILL THIS: /api/users/search
};
export const getUser = (id) => {
  if (MOCK_ENABLED) return mock(mockUsers.find(u => u._id === id) || mockUsers[1]);
  return API.get(`/api/users/${id}`); // FILL THIS: /api/users/:id
};
export const sendFriendRequest = (id) => {
  if (MOCK_ENABLED) return mock({ success: true });
  return API.post(`/api/users/${id}/friend-request`); // FILL THIS: /api/users/:id/friend-request
};
export const getFriendRequests = () => {
  if (MOCK_ENABLED) return mock(mockFriendRequests);
  return API.get('/api/users/friend-requests'); // FILL THIS: /api/users/friend-requests
};
export const acceptFriendRequest = (id) => {
  if (MOCK_ENABLED) return mock({ success: true });
  return API.put(`/api/users/friend-requests/${id}/accept`); // FILL THIS: /api/users/friend-requests/:id/accept
};
export const rejectFriendRequest = (id) => {
  if (MOCK_ENABLED) return mock({ success: true });
  return API.put(`/api/users/friend-requests/${id}/reject`); // FILL THIS: /api/users/friend-requests/:id/reject
};
export const getFriends = () => {
  if (MOCK_ENABLED) return mock([mockUsers[1], mockUsers[2]]);
  return API.get('/api/users/friends'); // FILL THIS: /api/users/friends
};

// ========== POSTS ==========
export const getPosts = () => {
  if (MOCK_ENABLED) return mock(mockPosts);
  return API.get('/api/posts'); // FILL THIS: /api/posts
};
export const createPost = (data) => {
  if (MOCK_ENABLED) {
    const text = data instanceof FormData ? data.get('text') : data.text;
    const newPost = { _id: 'p' + Date.now(), user: mockUser, text, likes: [], comments: [], createdAt: new Date() };
    mockPosts.unshift(newPost);
    return mock(newPost);
  }
  return API.post('/api/posts', data); // FILL THIS: /api/posts (multipart/form-data)
};
export const likePost = (id) => {
  if (MOCK_ENABLED) return mock({ success: true });
  return API.put(`/api/posts/${id}/like`); // FILL THIS: /api/posts/:id/like
};
export const commentOnPost = (id, data) => {
  if (MOCK_ENABLED) {
    const post = mockPosts.find(p => p._id === id);
    const newComment = { user: mockUser, text: data.text, createdAt: new Date() };
    if (post) post.comments.push(newComment);
    return mock({ comments: post?.comments || [newComment] });
  }
  return API.post(`/api/posts/${id}/comments`, data); // FILL THIS: /api/posts/:id/comments
};
export const getUserPosts = (id) => {
  if (MOCK_ENABLED) return mock(mockPosts.filter(p => p.user._id === id));
  return API.get(`/api/posts/user/${id}`); // FILL THIS: /api/posts/user/:id
};

// ========== MESSAGES ==========
export const getConversations = () => {
  if (MOCK_ENABLED) return mock([{ user: mockUsers[1], lastMessage: mockMessages[2] }]);
  return API.get('/api/messages/conversations'); // FILL THIS: /api/messages/conversations
};
export const getMessages = (userId) => {
  if (MOCK_ENABLED) return mock(mockMessages.filter(m => (m.from === userId || m.to === userId)));
  return API.get(`/api/messages/${userId}`); // FILL THIS: /api/messages/:userId
};
export const sendMessage = (data) => {
  if (MOCK_ENABLED) {
    const msg = { _id: 'm' + Date.now(), from: 'u1', to: data.to, text: data.text, createdAt: new Date() };
    mockMessages.push(msg);
    return mock(msg);
  }
  return API.post('/api/messages', data); // FILL THIS: /api/messages
};

export default API;
