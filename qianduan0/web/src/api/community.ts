import axios from 'axios'
import { ElMessage } from 'element-plus'

// 社区 API 专用 request 实例（指向 /app，后端 8001）
const request = axios.create({
  baseURL: '',
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && typeof body === 'object' && typeof body.code === 'number' && body.code !== 0) {
      ElMessage.error(body.message || '请求失败')
      if (body.code === 1001 || body.code === 1002) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(body.message))
    }
    return body
  },
  (err) => {
    ElMessage.error(err.message || '网络错误')
    return Promise.reject(err)
  }
)

// 社区 API
export const communityApi = {
  // 信息流（首页）
  getFeed(params: any) {
    return request.post('/app/notePost/feed', params)
  },

  // 发布游记
  publish(data: any) {
    return request.post('/app/notePost/publish', data)
  },

  // 游记详情
  getDetail(id: any) {
    return request.post('/app/notePost/detail', { id })
  },

  // 删除游记
  deletePost(id: any) {
    return request.post('/app/notePost/delete', { id })
  },

  // 搜索
  search(params: any) {
    return request.post('/app/notePost/search', params)
  },

  // 话题相关
  getTopics(params: any = {}) {
    return request.post('/app/noteTopic/list', params)
  },

  getTopicDetail(id: any) {
    return request.post('/app/noteTopic/detail', { id })
  },

  getTopicPosts(topicId: any, params: any) {
    return request.post('/app/noteTopic/posts', { topicId, ...params })
  },

  followTopic(topicId: any) {
    return request.post('/app/noteTopic/follow', { topicId })
  },

  // 评论相关
  getComments(postId: any, params: any) {
    return request.post('/app/noteComment/list', { postId, ...params })
  },

  addComment(postId: any, content: any, images: any = null) {
    return request.post('/app/noteComment/add', { postId, content, images })
  },

  deleteComment(id: any) {
    return request.post('/app/noteComment/delete', { id })
  },

  // 点赞相关
  likePost(postId: any) {
    return request.post('/app/noteFollow/like', { postId })
  },

  unlikePost(postId: any) {
    return request.post('/app/noteFollow/unlike', { postId })
  },

  // 举报相关
  reportPost(postId: any, reason: any) {
    return request.post('/app/noteReport/add', { postId, reason })
  }
}

// 上传 API
export const uploadApi = {
  upload(file: any) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
