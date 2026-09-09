import request from './request'

// 社区 API
export const communityApi = {
  // 信息流（首页）
  getFeed(params) {
    return request.get('/app/note/feed', { params })
  },

  // 发布游记
  publish(data) {
    return request.post('/app/note/publish', data)
  },

  // 游记详情
  getDetail(id) {
    return request.get(`/app/note/detail/${id}`)
  },

  // 删除游记
  deletePost(id) {
    return request.delete(`/app/note/delete/${id}`)
  },

  // 搜索
  search(params) {
    return request.get('/app/note/search', { params })
  },

  // 话题相关
  getTopics() {
    return request.get('/app/topic/list')
  },

  getTopicDetail(id) {
    return request.get(`/app/topic/detail/${id}`)
  },

  followTopic(id) {
    return request.post(`/app/topic/follow/${id}`)
  },

  // 评论相关
  getComments(postId, params) {
    return request.get(`/app/comment/list/${postId}`, { params })
  },

  createComment(data) {
    return request.post('/app/comment/create', data)
  },

  deleteComment(id) {
    return request.delete(`/app/comment/delete/${id}`)
  },

  // 点赞
  toggleLike(data) {
    return request.post('/app/like/toggle', data)
  },

  // 用户关注
  followUser(userId) {
    return request.post(`/app/user/follow/${userId}`)
  },

  unfollowUser(userId) {
    return request.delete(`/app/user/follow/${userId}`)
  },

  // 用户主页
  getUserProfile(userId) {
    return request.get(`/app/user/profile/${userId}`)
  },

  // 举报
  report(data) {
    return request.post('/app/report/create', data)
  }
}

// 文件上传
export const uploadApi = {
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadVideo(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/app/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  }
}
