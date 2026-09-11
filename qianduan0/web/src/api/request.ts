import axios from 'axios';
import { ElMessage } from 'element-plus';

// 统一请求封装：成功返回响应体（后端成功时直接返回数据，无 code 包装）
// 失败时返回 { code: 非0数字, message }，此处统一提示并 reject
const request = axios.create({ baseURL: '/api', timeout: 15000 });

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
    // 仅当 code 为数字且非 0 时视为业务错误（电子票等业务数据里的字符串 code 不误判）
    if (body && typeof body === 'object' && typeof body.code === 'number' && body.code !== 0) {
      ElMessage.error(body.message || '请求失败');
      if (body.code === 1001 || body.code === 1002) {
        // 登录失效，跳登录页
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
    // 否则 isLogin 仍为 true，顶栏等组件会每个页面反复请求受保护接口，导致全站刷 401。
    if (err?.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 只有"原本已登录"才提示并跳转，避免游客被无关接口的 401 反复踢到登录页
      if (hadToken && !window.location.pathname.startsWith('/login')) {
        ElMessage.error('登录已过期，请重新登录');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
    ElMessage.error(err.message || '网络错误');
    return Promise.reject(err);
  }
);

export default request;
