import axios from 'axios'

// 创建 request 实例，用于社区 API（直接代理到 /app）
const request = axios.create({
  baseURL: '',
  timeout: 10000
})

// 社区 API
export const communityApi = {
  // 信息流（首页）
  getFeed(params) {
    return request.post('/app/notePost/feed', params)
  },

  // 发布游记
  publish(data) {
    return request.post('/app/notePost/publish', data)
  },

  // 游记详情
  getDetail(id) {
    return request.post('/app/notePost/detail', { id })
  },

  // 删除游记
  deletePost(id) {
    return request.post('/app/notePost/delete', { id })
  },

  // 搜索
  search(params) {
    return request.post('/app/notePost/search', params)
  },

  // 话题相关
  getTopics(params = {}) {
    return request.post('/app/noteTopic/list', params)
  },

  getTopicDetail(id) {
    return request.post('/app/noteTopic/detail', { id })
  },

  getTopicPosts(topicId, params) {
    return request.post('/app/noteTopic/posts', { topicId, ...params })
  },

  followTopic(topicId) {
    return request.post('/app/noteTopic/follow', { topicId })
  },

  // 评论相关
  getComments(postId, params) {
    return request.post('/app/noteComment/list', { postId, ...params })
  },

  createComment(data) {
    return request.post('/app/noteComment/create', data)
  },

  deleteComment(id) {
    return request.post('/app/noteComment/delete', { id })
  },

  // 点赞
  toggleLike(data) {
    return request.post('/app/notePost/like/toggle', data)
  },

  // 用户关注
  followUser(userId) {
    return request.post('/app/noteFollow/toggle', { userId })
  },

  unfollowUser(userId) {
    return request.post('/app/noteFollow/toggle', { userId })
  },

  getFollowing(params) {
    return request.post('/app/noteFollow/following', params)
  },

  getFollowers(params) {
    return request.post('/app/noteFollow/followers', params)
  },

  // 收藏
  toggleFavorite(data) {
    return request.post('/app/favorite/toggle', data)
  },

  getFavorites(params) {
    return request.post('/app/favorite/list', params)
  },

  // 用户主页
  getUserProfile(userId) {
    return request.post('/app/user/profile', { userId })
  },

  // 举报
  report(data) {
    return request.post('/app/noteReport/create', data)
  }
}

// 文件上传
const uploadApiDuplicate = {
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/comm/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
      // 后端返回格式: { code: 0, data: "http://domain/upload/20260909/xxx.jpg" }
      return res.data || res
    })
  },

  uploadVideo(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/comm/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }).then(res => {
      // 后端返回格式: { code: 0, data: "http://domain/upload/20260909/xxx.mp4" }
      return res.data || res
    })
  }
}

// 文件上传
export const uploadApi = {
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/comm/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
      // 后端返回格式: { code: 0, data: "http://domain/upload/20260909/xxx.jpg" }
      return res.data || res
    })
  },

  uploadVideo(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/comm/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }).then(res => {
      // 后端返回格式: { code: 0, data: "http://domain/upload/20260909/xxx.mp4" }
      return res.data || res
    })
  }
}
