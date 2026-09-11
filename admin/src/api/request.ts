import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (res) => {
    const body = res.data;
    // 仅当 code 为数字且非 0 时视为业务错误
    if (body && typeof body === 'object' && typeof body.code === 'number' && body.code !== 0) {
      ElMessage.error(body.message || '请求失败');
      if (body.code === 1001 || body.code === 1002) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(body.message));
    }
    return body;
  },
  (err) => {
    // HTTP 401：登录态失效（token 过期/非法）。后端用 401 状态码返回，这里必须主动清理本地登录态，
    // 否则后台会带着失效 token 反复请求，每个页面都刷 401。
    if (err?.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      if (hadToken && !window.location.pathname.startsWith('/login')) {
        ElMessage.error('登录已过期，请重新登录');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
    ElMessage.error(err.response?.data?.message || err.message || '网络错误');
    return Promise.reject(err);
  }
);

export default request;
