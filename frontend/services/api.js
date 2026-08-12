import axios from 'axios';
import { getToken, setToken, removeToken } from '../utils/token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && error.response?.data?.message === 'Tài khoản của bạn đã bị khóa.') {
      removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login?error=' + encodeURIComponent(error.response.data.message);
      }
      return Promise.reject(error);
    }

    // Không refresh khi chính bản thân các endpoint auth báo 401 (login sai mật khẩu v.v.)
    // — tránh redirect lặp làm mất thông báo lỗi.
    const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']; // BUG-018: auth tập trung /api/auth/*
    const requestUrl = originalRequest?.url || '';
    if (AUTH_PATHS.some(p => requestUrl.includes(p))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // BUG-012: refresh token nằm trong httpOnly cookie — KHÔNG gửi trong body,
        // bắt buộc withCredentials để cookie tự động kèm theo.
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = data.data;
        
        setToken(accessToken);
        processQueue(null, accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        removeToken();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
