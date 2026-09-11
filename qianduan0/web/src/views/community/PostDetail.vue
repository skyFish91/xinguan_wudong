<template>
  <div class="post-detail-page">
    <div class="wd-container wd-page">
      <PageBack />
      <!-- 骨架屏 -->
      <div v-if="loading" class="detail-layout">
        <div class="main-col">
          <div class="wd-skel-card">
            <div class="wd-skel-body">
              <div class="wd-skeleton wd-skel-title"></div>
              <div class="wd-skeleton wd-skel-text"></div>
              <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
            </div>
          </div>
          <div class="wd-skeleton skel-hero"></div>
          <div class="wd-skel-card">
            <div class="wd-skel-body">
              <div class="wd-skeleton wd-skel-line"></div>
              <div class="wd-skeleton wd-skel-text"></div>
              <div class="wd-skeleton wd-skel-text"></div>
              <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
            </div>
          </div>
        </div>
        <aside class="side-col">
          <div class="wd-skel-card">
            <div class="wd-skel-body">
              <div class="wd-skeleton wd-skel-title"></div>
              <div class="wd-skeleton wd-skel-text"></div>
            </div>
          </div>
        </aside>
      </div>

      <div v-else class="detail-layout">
        <!-- 正文列 -->
        <main class="main-col">
          <!-- 作者 -->
          <div class="wd-card author-card">
            <div class="author-info" @click="$router.push(`/community/user/${post.userId}`)">
              <el-avatar :size="46" :src="post.userAvatar">
                {{ (post.userName || '旅').slice(0, 1) }}
              </el-avatar>
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

          <!-- 标题与话题 -->
          <h1 class="post-title">{{ post.title }}</h1>

          <div class="post-topics" v-if="post.topicNames && post.topicNames.length">
            <span
              v-for="(topicName, index) in post.topicNames"
              :key="index"
              class="topic-tag"
              @click="post.topics[index] && $router.push(`/community/topic/${post.topics[index].id}`)"
            >
              # {{ topicName }}
            </span>
          </div>

          <div class="post-poi" v-if="post.poiName">
            <el-icon><Location /></el-icon>
            <span>{{ post.poiName }}</span>
          </div>

          <!-- 媒体 -->
          <div class="post-media">
            <div class="video-player" v-if="post.videoUrl">
              <video :src="post.videoUrl" controls />
            </div>
            <div class="post-images" v-else-if="post.images && post.images.length">
              <el-image
                v-for="(pic, index) in post.images"
                :key="index"
                :src="pic"
                :preview-src-list="post.images"
                :initial-index="index"
                fit="cover"
                class="post-img"
              />
            </div>
          </div>

          <!-- 正文 -->
          <div class="wd-card post-body">
            <p v-for="(para, index) in paragraphs" :key="index">{{ para }}</p>
          </div>

          <!-- 互动栏 -->
          <div class="wd-card interaction-bar">
            <div :class="['interaction-btn', { liked: post.isLiked }]" @click="handleLike">
              <el-icon><StarFilled v-if="post.isLiked" /><Star v-else /></el-icon>
              <span>{{ formatCount(post.likeCount) }}</span>
            </div>
            <div class="interaction-btn" @click="focusCommentInput">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ formatCount(post.commentCount) }}</span>
            </div>
            <div :class="['interaction-btn', { saved: post.isFavorited }]" @click="handleFavorite">
              <el-icon><Star /></el-icon>
              <span>{{ post.isFavorited ? '已收藏' : '收藏' }}</span>
            </div>
            <div class="interaction-btn" @click="handleShare">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </div>
            <el-dropdown @command="handleMoreAction" class="more-drop">
              <div class="interaction-btn">
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="report" v-if="!isMyPost">举报</el-dropdown-item>
                  <el-dropdown-item command="delete" v-if="canDelete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 评论 -->
          <section class="wd-card comments-section">
            <h3 class="section-title">
              评论 <span class="count">{{ post.commentCount }}</span>
            </h3>

            <div class="comment-input">
              <el-avatar :size="36" :src="userInfo.avatar" />
              <el-input
                ref="commentInputRef"
                v-model="commentText"
                :rows="3"
                type="textarea"
                placeholder="写下你的评论…"
                maxlength="500"
                show-word-limit
              />
              <el-button type="primary" @click="handleComment" :loading="commentSubmitting">
                发布
              </el-button>
            </div>

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

            <div class="load-more-comments" v-if="hasMoreComments && comments.length">
              <el-button text @click="loadMoreComments" :loading="commentsLoading">
                加载更多评论
              </el-button>
            </div>

            <EmptyState
              v-else-if="!comments.length && !commentsLoading"
              title="还没有评论"
              desc="说点什么吧，你的经验可能正是别人需要的。"
            />
          </section>
        </main>

        <!-- 侧栏 -->
        <aside class="side-col">
          <div class="wd-card recommend-card" v-if="authorPosts.length">
            <h3 class="card-title">TA 的其他作品</h3>
            <div class="recommend-list">
              <div
                v-for="item in authorPosts"
                :key="item.id"
                class="recommend-item"
                @click="$router.push(`/community/${item.id}`)"
              >
                <div class="thumb">
                  <img :src="img(item.cover, item.title)" :alt="item.title" @error="imgError" />
                </div>
                <div class="recommend-info">
                  <h4 class="clamp-2">{{ item.title }}</h4>
                  <div class="recommend-stats">
                    <el-icon><View /></el-icon> {{ formatCount(item.viewCount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="wd-card recommend-card" v-if="recommendPosts.length">
            <h3 class="card-title">相关推荐</h3>
            <div class="recommend-list">
              <div
                v-for="item in recommendPosts"
                :key="item.id"
                class="recommend-item"
                @click="$router.push(`/community/${item.id}`)"
              >
                <div class="thumb">
                  <img :src="img(item.cover, item.title)" :alt="item.title" @error="imgError" />
                </div>
                <div class="recommend-info">
                  <h4 class="clamp-2">{{ item.title }}</h4>
                  <div class="recommend-stats">
                    <el-icon><View /></el-icon> {{ formatCount(item.viewCount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="wd-card side-empty" v-if="!authorPosts.length && !recommendPosts.length">
            <p class="side-empty-text">还没有更多相关内容</p>
            <router-link to="/community"><el-button text type="primary">去社区逛逛 →</el-button></router-link>
          </div>
        </aside>
      </div>
    </div>

    <ReportDialog v-model="showReportDialog" :post-id="post.id" />
  </div>
</template>

<script setup>
import PageBack from '../../components/PageBack.vue';
import EmptyState from '../../components/EmptyState.vue';
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus, Star, StarFilled, ChatDotRound, Share, View, Location, MoreFilled,
} from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage, ElMessageBox } from 'element-plus'
import { img, imgLarge, imgError, imgListLarge } from '../../utils/media'
import CommentItem from './components/CommentItem.vue'
import ReportDialog from './components/ReportDialog.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const post = ref({
  id: 0, title: '', content: '', images: [], videoUrl: '', topics: [], topicNames: [],
  poiName: '', userId: 0, userName: '', userAvatar: '', createTime: '',
  likeCount: 0, commentCount: 0, viewCount: 0, isLiked: false, isFavorited: false, isFollowed: false,
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

const userInfo = ref({
  id: 1,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
  role: 'USER',
})

const isMyPost = computed(() => post.value.userId === userInfo.value.id)
const canDelete = computed(() => userInfo.value.role === 'ADMIN' || isMyPost.value)

const paragraphs = computed(() =>
  post.value.content ? post.value.content.split('\n').filter((p) => p.trim()) : []
)

const loadPostDetail = async () => {
  loading.value = true
  try {
    const data = await communityApi.getDetail(route.params.id)
    post.value = {
      id: data.id,
      title: data.title,
      content: data.content,
      images: imgListLarge((data.images || []).map((it) => it.imageUrl || it.url), data.title),
      videoUrl: data.videoUrl,
      topics: data.topics || [],
      topicNames: data.topicNames || [],
      poiName: data.poiName || '',
      userId: data.userId,
      userName: data.userName || '乌东用户',
      userAvatar: data.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      createTime: data.createTime,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      viewCount: data.viewCount || 0,
      isLiked: data.liked || false,
      isFavorited: data.favorited || false,
      isFollowed: false,
    }
    loadComments(true)
    loadSidebar(data)
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

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
      pageSize: 10,
    })
    const commentList = res.list || res || []
    const mappedComments = commentList.map((item) => ({
      id: item.id,
      content: item.content,
      userId: item.userId,
      userName: item.userName || '乌东用户',
      userAvatar: item.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      createTime: item.createTime || new Date().toISOString(),
      likeCount: item.likeCount || 0,
      isLiked: false,
      parentId: item.parentId,
      replyToUserId: item.replyToUserId,
      replyToUserName: item.replyToUserName || '',
      rootId: item.rootId,
      replies: [],
      ...item,
    }))

    const commentMap = new Map()
    const rootComments = []
    mappedComments.forEach((c) => commentMap.set(c.id, c))
    mappedComments.forEach((c) => {
      if (!c.parentId || c.parentId === 0) {
        rootComments.push(c)
      } else {
        const parent = commentMap.get(c.parentId)
        if (parent) {
          if (!parent.replies) parent.replies = []
          parent.replies.push(c)
        }
      }
    })

    if (reset) comments.value = rootComments
    else comments.value.push(...rootComments)

    hasMoreComments.value = comments.value.length < (res.pagination?.total || 0)
    commentsPage.value++
  } catch (error) {
    console.error('加载评论失败', error)
  } finally {
    commentsLoading.value = false
  }
}

const loadMoreComments = () => loadComments(false)

/**
 * 侧栏推荐：原来用 picsum 随机占位图 + TODO 未实现。
 * 改为真实取数——作者作品按 authorId 过滤，相关推荐取热门游记并排除当前篇。
 */
const loadSidebar = async (detail) => {
  try {
    if (detail.userId) {
      const mine = await communityApi.getFeed({ authorId: detail.userId, page: 1, pageSize: 5 })
      authorPosts.value = (mine.list || []).filter((p) => p.id !== detail.id).slice(0, 4)
    }
  } catch {
    authorPosts.value = []
  }
  try {
    const hot = await communityApi.getFeed({ sort: 'hot', page: 1, pageSize: 7 })
    recommendPosts.value = (hot.list || []).filter((p) => p.id !== detail.id).slice(0, 5)
  } catch {
    recommendPosts.value = []
  }
}

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
    ElMessage.error('操作失败')
  }
}

const handleLike = async () => {
  try {
    await communityApi.toggleLike({ targetType: 'POST', targetId: post.value.id })
    post.value.isLiked = !post.value.isLiked
    post.value.likeCount += post.value.isLiked ? 1 : -1
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleFavorite = async () => {
  try {
    await communityApi.toggleFavorite({ targetType: 'NOTE', targetId: post.value.id })
    post.value.isFavorited = !post.value.isFavorited
    ElMessage.success(post.value.isFavorited ? '收藏成功' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleShare = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

const focusCommentInput = () => {
  nextTick(() => commentInputRef.value?.focus())
}

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
      rootId: null,
    })
    ElMessage.success('评论成功')
    commentText.value = ''
    post.value.commentCount++
    loadComments(true)
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    commentSubmitting.value = false
  }
}

const handleReplyComment = async ({ comment, content }) => {
  try {
    await communityApi.createComment({
      postId: post.value.id,
      content,
      parentId: comment.id,
      rootId: comment.rootId || comment.id,
    })
    ElMessage.success('回复成功')
    post.value.commentCount++
    loadComments(true)
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

const handleLikeComment = async (comment) => {
  try {
    await communityApi.toggleLike({ targetType: 'COMMENT', targetId: comment.id })
    comment.isLiked = !comment.isLiked
    comment.likeCount += comment.isLiked ? 1 : -1
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm('确认删除该评论？', '提示', { type: 'warning' })
    await communityApi.deleteComment(comment.id)
    ElMessage.success('删除成功')
    post.value.commentCount--
    loadComments(true)
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleMoreAction = async (command) => {
  if (command === 'report') {
    showReportDialog.value = true
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm('确认删除该游记？', '提示', { type: 'warning' })
      await communityApi.deletePost(post.value.id)
      ElMessage.success('删除成功')
      router.push('/community')
    } catch (error) {
      if (error !== 'cancel') ElMessage.error('删除失败')
    }
  }
}

const formatCount = (count) => {
  const n = Number(count) || 0
  return n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n
}

onMounted(() => {
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    try {
      const info = JSON.parse(savedUserInfo)
      userInfo.value = {
        id: info.id || 1,
        avatar: info.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
        role: info.role || 'USER',
      }
    } catch (e) {
      console.error('解析 userInfo 失败:', e)
    }
  }
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--wd-s8);
  padding-top: var(--wd-s5);
}

/* 作者卡 */
.author-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  padding: var(--wd-s4) var(--wd-s5);
  margin-bottom: var(--wd-s6);
}
.author-info {
  display: flex;
  align-items: center;
  gap: var(--wd-s4);
  cursor: pointer;
}
.author-name {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--wd-text-1);
  transition: color var(--wd-dur) var(--wd-ease);
}
.author-info:hover .author-name {
  color: var(--wd-brand);
}
.post-time {
  margin-top: 3px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

/* 标题区 */
.post-title {
  margin-bottom: var(--wd-s4);
  font-size: 32px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.post-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--wd-s3);
}
.topic-tag {
  padding: 6px 14px;
  border-radius: var(--wd-r-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--wd-indigo);
  background: #eef2f9;
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.topic-tag:hover {
  transform: translateY(-2px);
  background: #e3e9f5;
  box-shadow: var(--wd-sh-1);
}
.post-poi {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--wd-s5);
  font-size: 14px;
  color: var(--wd-brand);
}

/* 媒体 */
.post-media {
  margin-bottom: var(--wd-s6);
}
.video-player video {
  width: 100%;
  border-radius: var(--wd-r-md);
  display: block;
}
.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--wd-s4);
}
.post-img {
  width: 100%;
  border-radius: var(--wd-r-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--wd-sh-1);
  transition: transform var(--wd-dur) var(--wd-ease), box-shadow var(--wd-dur) var(--wd-ease);
}
.post-img:hover {
  transform: translateY(-4px);
  box-shadow: var(--wd-sh-3);
}

/* 正文 */
.post-body {
  padding: var(--wd-s7) var(--wd-s7);
  margin-bottom: var(--wd-s5);
  font-size: 15.5px;
  line-height: 1.9;
  color: var(--wd-text-2);
}
.post-body p {
  margin-bottom: var(--wd-s5);
}
.post-body p:last-child {
  margin-bottom: 0;
}

/* 互动栏 */
.interaction-bar {
  display: flex;
  align-items: center;
  gap: var(--wd-s6);
  padding: var(--wd-s4) var(--wd-s5);
  margin-bottom: var(--wd-s6);
}
.interaction-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: var(--wd-r-pill);
  font-size: 14px;
  color: var(--wd-text-2);
  cursor: pointer;
  user-select: none;
  transition: all 0.24s var(--wd-ease);
}
.interaction-btn:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.interaction-btn.liked {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.interaction-btn.saved {
  color: var(--wd-gold);
  background: #fdf8e8;
}
.more-drop {
  margin-left: auto;
}

/* 评论 */
.comments-section {
  padding: var(--wd-s6);
}
.section-title {
  margin-bottom: var(--wd-s5);
  font-size: 19px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.section-title .count {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--wd-text-4);
}
.comment-input {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--wd-s4);
  align-items: start;
  margin-bottom: var(--wd-s6);
}
.comment-list {
  border-top: 1px solid var(--wd-border);
  padding-top: var(--wd-s2);
}
.load-more-comments {
  text-align: center;
  padding: var(--wd-s5) 0 0;
}

/* 侧栏 */
.side-col {
  min-width: 0;
}
.recommend-card {
  padding: var(--wd-s5);
  margin-bottom: var(--wd-s5);
}
.recommend-card:last-child {
  margin-bottom: 0;
}
.card-title {
  margin-bottom: var(--wd-s4);
  padding-bottom: var(--wd-s3);
  border-bottom: 1px solid var(--wd-border);
  font-size: 16px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.recommend-item {
  display: flex;
  gap: var(--wd-s3);
  padding: 8px 0;
  cursor: pointer;
}
.recommend-item + .recommend-item {
  border-top: 1px dashed var(--wd-border);
}
.thumb {
  flex-shrink: 0;
  width: 84px;
  height: 62px;
  border-radius: var(--wd-r-xs);
  overflow: hidden;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--wd-ease);
}
.recommend-item:hover .thumb img {
  transform: scale(1.08);
}
.recommend-info {
  flex: 1;
  min-width: 0;
}
.recommend-info h4 {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--wd-text-1);
  transition: color var(--wd-dur) var(--wd-ease);
}
.recommend-item:hover h4 {
  color: var(--wd-brand);
}
.recommend-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--wd-text-4);
}
.side-empty {
  padding: var(--wd-s6) var(--wd-s5);
  text-align: center;
}
.side-empty-text {
  font-size: 13px;
  color: var(--wd-text-4);
}

/* 骨架 */
.skel-hero {
  height: 320px;
  border-radius: var(--wd-r-md);
  margin: var(--wd-s5) 0;
}

@media (max-width: 1000px) {
  .detail-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .post-title {
    font-size: 25px;
  }
  .post-body {
    padding: var(--wd-s5);
  }
  .comment-input {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
