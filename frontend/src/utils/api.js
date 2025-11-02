import axios from 'axios';

const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  return `${BACKEND_URL}${imagePath}`;
};

const api = axios.create({
  baseURL: `${API_URL}/${API_VERSION}`,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${API_URL}/${API_VERSION}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );
          
          if (refreshResponse.data?.status) {
            const newToken = refreshResponse.data.data.token;
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (data) => api.post('/auth/refresh', data),
  logout: (data) => api.post('/auth/logout', data),
};

export const postAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'tags' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key !== 'image') {
        formData.append(key, data[key]);
      }
    });
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePost: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'tags' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key !== 'image') {
        formData.append(key, data[key]);
      }
    });
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    return api.put(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePost: (id) => api.delete(`/posts/${id}`),
  getPublicPosts: (params) => api.get('/posts/public', { params }),
};

export const commentAPI = {
  getComments: (postId) => api.get(`/comments/post/${postId}`),
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getUserStats: () => api.get('/users/stats'),
  getAllUsers: (params) => api.get('/users', { params }),
};

export default api;

