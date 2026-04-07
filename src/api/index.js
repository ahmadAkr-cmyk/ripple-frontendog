import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// AUTH
export const login = (data) =>
  API.post('/api/auth/login', data)

export const register = (data) =>
  API.post('/api/auth/register', data)

// USERS
export const searchUsers = (query) =>
  API.get(`/api/users/search?name=${query}`)

export const getUser = (id) =>
  API.get(`/api/users/${id}`)

export const sendFriendRequest = (id) =>
  API.post(`/api/users/request/${id}`)

export const getFriendRequests = () =>
  API.get('/api/users/requests')

export const acceptFriendRequest = (requestId) =>
  API.put(`/api/users/request/${requestId}/accept`)

export const rejectFriendRequest = (requestId) =>
  API.put(`/api/users/request/${requestId}/reject`)

export const getFriends = () =>
  API.get('/api/users/friends')

export const getMyProfile = () =>
  API.get('/api/users/me')

// POSTS
export const getPosts = () =>
  API.get('/api/posts')

export const createPost = (data) =>
  API.post('/api/posts', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const deletePost = (id) =>
  API.delete(`/api/posts/${id}`)

export const likePost = (id) =>
  API.put(`/api/posts/${id}/like`)

export const commentOnPost = (id, data) =>
  API.post(`/api/posts/${id}/comment`, data)

export const deleteComment = (postId, commentId) =>
  API.delete(`/api/posts/${postId}/comments/${commentId}`)

export const getUserPosts = (id) =>
  API.get(`/api/posts/user/${id}`)

// MESSAGES
export const getConversations = () =>
  API.get('/api/messages/conversations')

export const getMessages = (userId) =>
  API.get(`/api/messages/${userId}`)

export const sendMessage = (userId, payload) => {
  // If it's already FormData, just send it (Axios handles boundary)
  if (payload instanceof FormData) {
    return API.post(`/api/messages/${userId}`, payload)
  }

  // If it's a plain object, convert to FormData
  const formData = new FormData()
  Object.keys(payload).forEach(key => {
    if (typeof payload[key] === 'object' && payload[key] !== null) {
      formData.append(key, JSON.stringify(payload[key]))
    } else {
      formData.append(key, payload[key])
    }
  })

  return API.post(`/api/messages/${userId}`, formData)
}

export const unsendMessage = (messageId) =>
  API.delete(`/api/messages/${messageId}`)

// AI
export const chatWithAI = (message, history) =>
  API.post('/api/ai/chat', { message, history })

export default API
