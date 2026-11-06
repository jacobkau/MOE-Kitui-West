import axios from 'axios';

// Use the live Render URL
const api = axios.create({
  baseURL: 'https://moe-kitui-west.onrender.com/api',
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
