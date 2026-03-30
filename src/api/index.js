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

// ============ AUTH ============
export const login = (data) => API.post('/api/auth/login', data); // FILL THIS: /api/auth/login
export const register = (data) => API.post('/api/auth/register', data); // FILL THIS: /api/auth/register

// ============ USERS ============
export const searchUsers = (query) => API.get(`/api/users/search?q=${query}`); // FILL THIS: /api/users/search
export const getUser = (id) => API.get(`/api/users/${id}`); // FILL THIS: /api/users/:id
export const sendFriendRequest = (id) => API.post(`/api/users/${id}/friend-request`); // FILL THIS: /api/users/:id/friend-request
export const getFriendRequests = () => API.get('/api/users/friend-requests'); // FILL THIS: /api/users/friend-requests
export const acceptFriendRequest = (id) => API.put(`/api/users/friend-requests/${id}/accept`); // FILL THIS: /api/users/friend-requests/:id/accept
export const rejectFriendRequest = (id) => API.put(`/api/users/friend-requests/${id}/reject`); // FILL THIS: /api/users/friend-requests/:id/reject
export const getFriends = () => API.get('/api/users/friends'); // FILL THIS: /api/users/friends

// ============ POSTS ============
export const getPosts = () => API.get('/api/posts'); // FILL THIS: /api/posts
export const createPost = (data) => API.post('/api/posts', data); // FILL THIS: /api/posts (multipart/form-data)
export const likePost = (id) => API.put(`/api/posts/${id}/like`); // FILL THIS: /api/posts/:id/like
export const commentOnPost = (id, data) => API.post(`/api/posts/${id}/comments`, data); // FILL THIS: /api/posts/:id/comments
export const getUserPosts = (id) => API.get(`/api/posts/user/${id}`); // FILL THIS: /api/posts/user/:id

// ============ MESSAGES ============
export const getConversations = () => API.get('/api/messages/conversations'); // FILL THIS: /api/messages/conversations
export const getMessages = (userId) => API.get(`/api/messages/${userId}`); // FILL THIS: /api/messages/:userId
export const sendMessage = (data) => API.post('/api/messages', data); // FILL THIS: /api/messages

export default API;
