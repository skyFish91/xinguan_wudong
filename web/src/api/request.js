import axios from 'axios'

const request = axios.create({
  baseURL: '',  // 不需要前缀，直接使用完整路径
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      // 直接传token，不加Bearer前缀
      config.headers.Authorization = token
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, data, message } = response.data || {}
    // 后端返回 code: 1000 表示成功，code: 0 也表示成功
    if (code === 0 || code === 1000) {
      return data
    } else {
      console.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
    console.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
