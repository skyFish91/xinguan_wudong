<template>
  <div>
    <TopNav />
    <div class="page" v-if="post.id">
      <h2>{{ post.title }}</h2>
      <div class="head-meta">
        <span v-if="post.topic">#{{ post.topic.name }}</span>
        <span>{{ post.author?.nickname || `用户${post.userId}` }}</span>
        <span>{{ formatTime(post.publishedAt || post.createdAt) }}</span>
        <span>浏览 {{ post.viewCount }}</span>
      </div>

      <div class="content">{{ post.content }}</div>

      <div class="images" v-if="imageList.length">
        <img v-for="(img, i) in imageList" :key="i" :src="img" class="content-img" />
      </div>
      <div v-if="post.videoUrl" class="video-box">
        <video :src="post.videoUrl" controls class="video" />
      </div>

      <!-- 作者与互动 -->
      <div class="author-card" v-if="post.author">
        <div class="author-line">
          <span class="author-name">{{ post.author.nickname }}</span>
          <span class="author-bio">{{ post.author.bio }}</span>
          <el-button
            v-if="userStore.isLogin && userStore.userInfo?.id !== post.author.id"
            size="small"
            :type="post.followed ? 'info' : 'primary'"
            @click="toggleFollow"
          >
            {{ post.followed ? '已关注' : '+ 关注' }}
          </el-button>
        </div>
      </div>

      <div class="actions">
        <el-button :type="post.liked ? 'danger' : 'default'" @click="toggleLike">
          点赞 {{ post.likeCount }}
        </el-button>
        <el-button :type="post.favorited ? 'warning' : 'default'" @click="toggleFavorite">
          {{ post.favorited ? '已收藏' : '收藏' }} {{ post.favoriteCount }}
        </el-button>
        <el-button @click="reportDialog = true">举报</el-button>
      </div>

      <!-- 评论 -->
      <el-divider content-position="left">评论（{{ post.commentCount }}）</el-divider>
      <div class="comment-form" v-if="userStore.isLogin">
        <el-input v-model="commentText" type="textarea" :rows="3" placeholder="发表你的评论" maxlength="500" />
        <el-button type="primary" class="comment-btn" @click="submitComment()">发表评论</el-button>
      </div>
      <div v-else class="comment-tip">登录后可发表评论</div>

      <div v-for="c in comments" :key="c.id" class="comment">
        <div class="comment-head">
          <span class="comment-user">{{ c.user?.nickname || `用户${c.userId}` }}</span>
          <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
          <el-button
            v-if="userStore.isLogin && userStore.userInfo?.id === c.userId"
            link
            type="danger"
            size="small"
            @click="deleteComment(c)"
          >
            删除
          </el-button>
        </div>
        <div class="comment-content">{{ c.content }}</div>
        <div class="comment-ops">
          <el-button link size="small" @click="replyTo(c)">回复</el-button>
          <el-button link size="small" @click="toggleCommentLike(c)">赞 {{ c.likeCount }}</el-button>
        </div>
        <div v-for="r in c.replies" :key="r.id" class="reply">
          <span class="comment-user">{{ r.user?.nickname || `用户${r.userId}` }}</span>
          <span v-if="r.replyTo" class="reply-to">回复 @{{ r.replyTo.nickname }}</span>
          ：{{ r.content }}
          <span class="comment-time">{{ formatTime(r.createdAt) }}</span>
        </div>
      </div>
      <el-empty v-if="!comments.length" description="暂无评论" />

      <!-- 举报弹窗 -->
      <el-dialog v-model="reportDialog" title="举报该游记" width="420px">
        <el-input v-model="reportReason" type="textarea" :rows="3" placeholder="请填写举报原因" />
        <template #footer>
          <el-button @click="reportDialog = false">取消</el-button>
          <el-button type="danger" @click="submitReport">提交举报</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const post = ref<any>({});
const comments = ref<any[]>([]);
const commentText = ref('');
const replyingTo = ref<number>(0);
const reportDialog = ref(false);
const reportReason = ref('');

const imageList = computed(() => {
  try {
    return JSON.parse(post.value.images || '[]');
  } catch {
    return [];
  }
});

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

function needLogin() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return true;
  }
  return false;
}

async function load() {
  try {
    post.value = await request.get(`/app/note/detail/${route.params.id}`);
  } catch {
    // 已提示
  }
  await loadComments();
}

async function loadComments() {
  try {
    comments.value = await request.get(`/app/note/${route.params.id}/comments`);
  } catch {
    // 已提示
  }
}

async function toggleLike() {
  if (needLogin()) return;
  try {
    const r: any = await request.post('/app/like/toggle', { targetType: 'post', targetId: post.value.id });
    post.value.liked = r.liked;
    post.value.likeCount += r.liked ? 1 : -1;
  } catch {
    // 已提示
  }
}

async function toggleFavorite() {
  if (needLogin()) return;
  try {
    const r: any = await request.post(`/app/note/${post.value.id}/favorite`);
    post.value.favorited = r?.favorited ?? !post.value.favorited;
    post.value.favoriteCount += post.value.favorited ? 1 : -1;
    ElMessage.success(post.value.favorited ? '已收藏' : '已取消收藏');
  } catch {
    // 已提示
  }
}

async function toggleFollow() {
  if (needLogin()) return;
  try {
    const r: any = await request.post('/app/user/follow', { followUserId: post.value.author.id });
    post.value.followed = r?.followed ?? !post.value.followed;
  } catch {
    // 已提示
  }
}

function replyTo(c: any) {
  if (needLogin()) return;
  replyingTo.value = c.id;
  commentText.value = `回复 @${c.user?.nickname || ''}：`;
}

async function submitComment(parentId = 0) {
  if (needLogin()) return;
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  try {
    const r: any = await request.post(`/app/note/${post.value.id}/comments`, {
      content: commentText.value,
      parentId: parentId || replyingTo.value || undefined,
    });
    if (r?.needAudit) {
      ElMessage.warning('评论触发敏感词检测，审核通过后可见');
    }
    commentText.value = '';
    replyingTo.value = 0;
    loadComments();
  } catch {
    // 已提示
  }
}

async function deleteComment(c: any) {
  try {
    await request.post(`/app/comment/${c.id}/delete`);
    ElMessage.success('已删除');
    loadComments();
  } catch {
    // 已提示
  }
}

async function toggleCommentLike(c: any) {
  if (needLogin()) return;
  try {
    const r: any = await request.post('/app/like/toggle', { targetType: 'comment', targetId: c.id });
    c.likeCount += r.liked ? 1 : -1;
  } catch {
    // 已提示
  }
}

async function submitReport() {
  if (!reportReason.value.trim()) {
    ElMessage.warning('请填写举报原因');
    return;
  }
  try {
    await request.post('/app/report/create', {
      targetType: 'post',
      targetId: post.value.id,
      reason: reportReason.value,
    });
    ElMessage.success('举报已提交，平台会尽快处理');
    reportDialog.value = false;
    reportReason.value = '';
  } catch {
    // 已提示
  }
}

onMounted(load);
</script>

<style scoped>
.page {
  max-width: 860px;
  margin: 0 auto;
  padding: 20px;
}
.head-meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 13px;
  margin-top: 10px;
}
.content {
  margin-top: 20px;
  line-height: 1.9;
  white-space: pre-wrap;
}
.images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
.content-img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
}
.video-box {
  margin-top: 16px;
}
.video {
  width: 100%;
  max-height: 400px;
  border-radius: 6px;
}
.author-card {
  margin-top: 20px;
  padding: 14px;
  background: #fafafa;
  border-radius: 8px;
}
.author-line {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-name {
  font-weight: 600;
}
.author-bio {
  color: #999;
  font-size: 13px;
  flex: 1;
}
.actions {
  margin-top: 16px;
}
.comment-form {
  margin-bottom: 20px;
}
.comment-btn {
  margin-top: 10px;
}
.comment-tip {
  color: #999;
  margin-bottom: 12px;
}
.comment {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.comment-user {
  font-weight: 600;
  font-size: 13px;
}
.comment-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}
.comment-content {
  margin-top: 6px;
  color: #333;
}
.comment-ops {
  margin-top: 4px;
}
.reply {
  margin: 8px 0 0 24px;
  padding: 8px 10px;
  background: #f7f7f7;
  border-radius: 6px;
  font-size: 13px;
  color: #444;
}
.reply-to {
  color: #c0392b;
}
</style>
