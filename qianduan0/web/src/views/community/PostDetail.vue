<template>
  <div class="post-detail-page">
    <div class="container">
      <div class="detail-container">
        <!-- 左侧内容 -->
        <div class="post-content">
          <!-- 作者信息 -->
          <div class="author-card card">
            <div class="author-info" @click="$router.push(`/user/${post.userId}`)" style="cursor: pointer;">
              <el-avatar :size="48" :src="post.userAvatar" style="cursor: pointer;" />
              <div class="author-meta">
                <div class="author-name">{{ post.userName }}</div>
                <div class="post-time">{{ post.createTime }}</div>
              </div>
            </div>
            <el-button
              v-if="!isMyPost"
              :type="post.isFollowed ? '' : 'primary'"
              round
              @click="handleFollow"
            >
              <el-icon v-if="!post.isFollowed"><Plus /></el-icon>
              {{ post.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>

          <!-- 标题 -->
          <h1 class="post-title">{{ post.title }}</h1>

          <!-- 话题标签 -->
          <div class="post-topics" v-if="post.topicNames && post.topicNames.length">
            <el-tag
              v-for="(topicName, index) in post.topicNames"
              :key="index"
              type="primary"
              class="topic-tag"
              @click="post.topics[index] && $router.push(`/community/topic/${post.topics[index].id}`)"
            >
              # {{ topicName }}
            </el-tag>
          </div>

          <!-- 关联地点 -->
          <div class="post-poi" v-if="post.poiName">
            <el-icon><Location /></el-icon>
            <span>{{ post.poiName }}</span>
          </div>

          <!-- 图片或视频 -->
          <div class="post-media">
            <!-- 视频 -->
            <div class="video-player" v-if="post.videoUrl">
              <video :src="post.videoUrl" controls style="width: 100%; border-radius: 12px" />
            </div>

            <!-- 图片 -->
            <div class="post-images" v-else-if="post.images && post.images.length">
              <el-image
                v-for="(img, index) in post.images"
                :key="index"
                :src="img"
                :preview-src-list="post.images"
                :initial-index="index"
                fit="cover"
                class="post-img"
              />
            </div>
          </div>

          <!-- 正文 -->
          <div class="post-body">
            <p v-for="(para, index) in paragraphs" :key="index">
              {{ para }}
            </p>
          </div>

          <!-- 互动栏 -->
          <div class="interaction-bar">
            <div
              :class="['interaction-btn', { active: post.isLiked }]"
              @click="handleLike"
            >
              <el-icon><StarFilled v-if="post.isLiked" /><Star v-else /></el-icon>
              <span>{{ formatCount(post.likeCount) }}</span>
            </div>
            <div class="interaction-btn" @click="focusCommentInput">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ formatCount(post.commentCount) }}</span>
            </div>
            <div
              :class="['interaction-btn', { active: post.isFavorited }]"
              @click="handleFavorite"
            >
              <el-icon><Star /></el-icon>
              <span>{{ post.isFavorited ? '已收藏' : '收藏' }}</span>
            </div>
            <div class="interaction-btn" @click="handleShare">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </div>
            <el-dropdown @command="handleMoreAction" style="margin-left: auto">
              <div class="interaction-btn">
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="report" v-if="!isMyPost">
                    举报
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" v-if="canDelete">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 评论区 -->
          <div class="comments-section card">
            <h3 class="section-title">
              评论 <span class="count">({{ post.commentCount }})</span>
            </h3>

            <!-- 评论输入 -->
            <div class="comment-input">
              <el-avatar :size="36" :src="userInfo.avatar" />
              <el-input
                ref="commentInputRef"
                v-model="commentText"
                :rows="3"
                type="textarea"
                placeholder="写下你的评论..."
                maxlength="500"
                show-word-limit
              />
              <el-button type="primary" @click="handleComment" :loading="commentSubmitting">
                发布
              </el-button>
            </div>

            <!-- 评论列表 -->
            <div class="comment-list" v-if="comments.length">
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                @reply="handleReplyComment"
                @like="handleLikeComment"
                @delete="handleDeleteComment"
              />
            </div>

            <!-- 加载更多评论 -->
            <div class="load-more-comments" v-if="hasMoreComments">
              <el-button text @click="loadMoreComments" :loading="commentsLoading">
                加载更多评论
              </el-button>
            </div>

            <el-empty v-if="!comments.length && !commentsLoading" description="暂无评论" />
          </div>
        </div>

        <!-- 右侧推荐 -->
        <div class="sidebar">
          <!-- 作者其他作品 -->
          <div class="recommend-card card" v-if="authorPosts.length">
            <h3 class="card-title">TA 的其他作品</h3>
            <div class="recommend-list">
              <div
                v-for="item in authorPosts"
                :key="item.id"
                class="recommend-item"
                @click="$router.push(`/community/${item.id}`)"
              >
                <img :src="item.cover" :alt="item.title" />
                <div class="recommend-info">
                  <h4>{{ item.title }}</h4>
                  <div class="recommend-stats">
                    <span><el-icon><View /></el-icon> {{ formatCount(item.viewCount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 相关推荐 -->
          <div class="recommend-card card">
            <h3 class="card-title">相关推荐</h3>
            <div class="recommend-list">
              <div
                v-for="item in recommendPosts"
                :key="item.id"
                class="recommend-item"
                @click="$router.push(`/community/${item.id}`)"
              >
                <img :src="item.cover" :alt="item.title" />
                <div class="recommend-info">
                  <h4>{{ item.title }}</h4>
                  <div class="recommend-stats">
                    <span><el-icon><View /></el-icon> {{ formatCount(item.viewCount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 举报对话框 -->
    <ReportDialog v-model="showReportDialog" :post-id="post.id" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus,
  Star,
  StarFilled,
  ChatDotRound,
  Share,
  View,
  Location,
  MoreFilled
} from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommentItem from './components/CommentItem.vue'
import ReportDialog from './components/ReportDialog.vue'

const route = useRoute()
const router = useRouter()

const post = ref({
  id: 0,
  title: '',
  content: '',
  images: [],
  videoUrl: '',
  topics: [],
  poiName: '',
  userId: 0,
  userName: '',
  userAvatar: '',
  createTime: '',
  likeCount: 0,
  commentCount: 0,
  viewCount: 0,
  isLiked: false,
  isFavorited: false,
  isFollowed: false
})

const comments = ref([])
const commentText = ref('')
const commentInputRef = ref(null)
const commentSubmitting = ref(false)
const commentsLoading = ref(false)
const hasMoreComments = ref(true)
const commentsPage = ref(1)

const authorPosts = ref([])
const recommendPosts = ref([])
const showReportDialog = ref(false)

// 用户信息（从 store 或 localStorage 获取）
const userInfo = ref({
  id: 1,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
  role: 'USER'
})

// 是否是我的帖子
const isMyPost = computed(() => post.value.userId === userInfo.value.id)

// 是否可以删除（是ADMIN或是作者）
const canDelete = computed(() => {
  return userInfo.value.role === 'ADMIN' || isMyPost.value
})

// 分段显示正文
const paragraphs = computed(() => {
  return post.value.content ? post.value.content.split('\n').filter(p => p.trim()) : []
})

// 加载游记详情
const loadPostDetail = async () => {
  try {
    const data = await communityApi.getDetail(route.params.id)
    // data 已经是响应的 data 字段（request拦截器处理过）
    post.value = {
      id: data.id,
      title: data.title,
      content: data.content,
      images: (data.images || []).map(img => img.imageUrl || img.url),
      videoUrl: data.videoUrl,
      topics: data.topics || [],
      topicNames: data.topicNames || [],
      poiName: data.poiName || '',
      userId: data.userId,
      userName: data.userName || '用户',
      userAvatar: data.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      createTime: data.createTime,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      viewCount: data.viewCount || 0,
      isLiked: data.liked || false,
      isFavorited: data.favorited || false,
      isFollowed: false
    }
    // 加载评论
    loadComments(true)
  } catch (error) {
    ElMessage.error('加载失败')
    console.error(error)
  }
}

// 加载评论
const loadComments = async (reset = false) => {
  if (commentsLoading.value) return

  commentsLoading.value = true
  try {
    if (reset) {
      commentsPage.value = 1
      comments.value = []
    }

    const res = await communityApi.getComments(route.params.id, {
      page: commentsPage.value,
      pageSize: 10
    })

    // request 拦截器已返回 data 字段
    const commentList = res.list || res || []

    // 字段映射（后端返回camelCase）
    const mappedComments = commentList.map(item => ({
      id: item.id,
      content: item.content,
      userId: item.userId,
      userName: item.userName || '用户',
      userAvatar: item.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      createTime: item.createTime || new Date().toISOString(),
      likeCount: item.likeCount || 0,
      isLiked: false,
      parentId: item.parentId,
      replyToUserId: item.replyToUserId,
      replyToUserName: item.replyToUserName || '',
      rootId: item.rootId,
      replies: [],
      ...item
    }))

    // 构建树形结构
    const commentMap = new Map()
    const rootComments = []

    // 先将所有评论放入 map
    mappedComments.forEach(comment => {
      commentMap.set(comment.id, comment)
    })

    // 构建树形结构
    mappedComments.forEach(comment => {
      if (!comment.parentId || comment.parentId === 0) {
        // 根评论
        rootComments.push(comment)
      } else {
        // 二级或多级评论，找到父评论并加入 replies 数组
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          if (!parent.replies) {
            parent.replies = []
          }
          parent.replies.push(comment)
        }
      }
    })

    if (reset) {
      comments.value = rootComments
    } else {
      comments.value.push(...rootComments)
    }

    hasMoreComments.value = comments.value.length < (res.pagination?.total || 0)
    commentsPage.value++
  } catch (error) {
    console.error('加载评论失败', error)
  } finally {
    commentsLoading.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  loadComments(false)
}

// 关注/取关
const handleFollow = async () => {
  try {
    if (post.value.isFollowed) {
      await communityApi.unfollowUser(post.value.userId)
      post.value.isFollowed = false
      ElMessage.success('已取消关注')
    } else {
      await communityApi.followUser(post.value.userId)
      post.value.isFollowed = true
      ElMessage.success('关注成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 点赞
const handleLike = async () => {
  try {
    await communityApi.toggleLike({
      targetType: 'POST',
      targetId: post.value.id
    })

    post.value.isLiked = !post.value.isLiked
    post.value.likeCount += post.value.isLiked ? 1 : -1
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 收藏
const handleFavorite = async () => {
  try {
    await communityApi.toggleFavorite({
      targetType: 'NOTE',
      targetId: post.value.id
    })
    post.value.isFavorited = !post.value.isFavorited
    ElMessage.success(post.value.isFavorited ? '收藏成功' : '已取消收藏')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 分享
const handleShare = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

// 聚焦评论输入框
const focusCommentInput = () => {
  nextTick(() => {
    commentInputRef.value?.focus()
  })
}

// 发表评论
const handleComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commentSubmitting.value = true
  try {
    await communityApi.createComment({
      postId: post.value.id,
      content: commentText.value,
      parentId: null,
      rootId: null
    })

    ElMessage.success('评论成功')
    commentText.value = ''
    post.value.commentCount++
    loadComments(true)
  } catch (error) {
    ElMessage.error(error.message || '评论失败')
  } finally {
    commentSubmitting.value = false
  }
}

// 回复评论
const handleReplyComment = async ({ comment, content }) => {
  try {
    await communityApi.createComment({
      postId: post.value.id,
      content,
      parentId: comment.id,
      rootId: comment.rootId || comment.id
    })

    ElMessage.success('回复成功')
    post.value.commentCount++
    loadComments(true)
  } catch (error) {
    ElMessage.error(error.message || '回复失败')
  }
}

// 点赞评论
const handleLikeComment = async (comment) => {
  try {
    await communityApi.toggleLike({
      targetType: 'COMMENT',
      targetId: comment.id
    })

    comment.isLiked = !comment.isLiked
    comment.likeCount += comment.isLiked ? 1 : -1
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除评论
const handleDeleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm('确认删除该评论？', '提示', {
      type: 'warning'
    })

    await communityApi.deleteComment(comment.id)
    ElMessage.success('删除成功')
    post.value.commentCount--
    loadComments(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 更多操作
const handleMoreAction = async (command) => {
  if (command === 'report') {
    showReportDialog.value = true
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm('确认删除该游记？', '提示', {
        type: 'warning'
      })

      await communityApi.deletePost(post.value.id)
      ElMessage.success('删除成功')
      router.push('/community')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }
}

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count
}

// 加载作者其他作品
const loadAuthorPosts = () => {
  // TODO: 实际从 API 加载
  authorPosts.value = []
}

// 加载推荐
const loadRecommendPosts = () => {
  // TODO: 实际从 API 加载
  recommendPosts.value = Array.from({ length: 5 }, (_, i) => ({
    id: i + 100,
    title: `推荐游记 ${i + 1}`,
    cover: `https://picsum.photos/200/150?random=${i + 1}`,
    viewCount: Math.floor(Math.random() * 3000) + 500
  }))
}

onMounted(() => {
  // 从 localStorage 读取当前用户信息
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    try {
      const info = JSON.parse(savedUserInfo)
      userInfo.value = {
        id: info.id || 1,
        avatar: info.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
        role: info.role || 'USER'
      }
    } catch (e) {
      console.error('解析userInfo失败:', e)
    }
  }

  loadPostDetail()
  loadComments(true)
  loadAuthorPosts()
  loadRecommendPosts()
})
</script>

<style lang="scss" scoped>
.post-detail-page {
  background: #f5f7fa;
  padding: 40px 0;

  .detail-container {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 32px;
  }

  .post-content {
    .author-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .author-info {
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;

        &:hover .author-name {
          color: #667eea;
        }

        .author-meta {
          .author-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
            transition: color 0.3s;
          }

          .post-time {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }

    .post-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .post-topics {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .topic-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .post-poi {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #667eea;
      font-size: 15px;
      margin-bottom: 24px;
    }

    .post-media {
      margin-bottom: 32px;

      .post-images {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;

        .post-img {
          width: 100%;
          border-radius: 12px;
          cursor: pointer;
        }
      }
    }

    .post-body {
      background: #fff;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 24px;
      line-height: 1.8;
      font-size: 16px;

      p {
        margin-bottom: 20px;
        text-indent: 2em;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .interaction-bar {
      display: flex;
      gap: 32px;
      padding: 24px;
      background: #fff;
      border-radius: 12px;
      margin-bottom: 24px;
      align-items: center;

      .interaction-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: #666;
        transition: color 0.3s;
        user-select: none;

        &:hover {
          color: #667eea;
        }

        &.active {
          color: #f56c6c;
        }
      }
    }

    .comments-section {
      .section-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 24px;

        .count {
          color: #999;
          font-weight: normal;
        }
      }

      .comment-input {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 16px;
        align-items: start;
        margin-bottom: 32px;
      }

      .load-more-comments {
        text-align: center;
        padding: 20px 0;
      }
    }
  }

  .sidebar {
    .recommend-card {
      position: sticky;
      top: 90px;
      margin-bottom: 24px;

      .card-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .recommend-list {
        .recommend-item {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          cursor: pointer;

          &:hover h4 {
            color: #667eea;
          }

          img {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
          }

          .recommend-info {
            flex: 1;

            h4 {
              font-size: 14px;
              margin-bottom: 8px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              transition: color 0.3s;
            }

            .recommend-stats {
              font-size: 12px;
              color: #999;

              span {
                display: flex;
                align-items: center;
                gap: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>

