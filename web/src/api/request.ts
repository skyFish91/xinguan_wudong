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
    // 后端返回格式：{ code: 1000, message: 'success', data: {...} }
    // code: 1000 表示成功，其他表示失败
    if (body && typeof body === 'object') {
      if (typeof body.code === 'number') {
        if (body.code === 1000) {
          // 成功：返回 data 部分
          return body.data || body;
        } else {
          // 业务错误
          ElMessage.error(body.message || '请求失败');
          if (body.code === 1001 || body.code === 1002) {
            // 登录失效，跳登录页
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
          }
          return Promise.reject(new Error(body.message));
        }
      }
    }
    // 没有 code 字段，直接返回
    return body;
  },
  (err) => {
    ElMessage.error(err.message || '网络错误');
    return Promise.reject(err);
  }
);

export default request;
