<template>
  <div class="comment-item">
    <UserAvatar :size="40" :src="comment.userAvatar" :seed="comment.userId || comment.userName" />
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author">{{ comment.userName }}</span>
        <span class="comment-time">{{ comment.createTime }}</span>
      </div>
      <p class="comment-text">{{ comment.content }}</p>

      <!-- 回复列表 -->
      <div class="comment-replies" v-if="comment.replies && comment.replies.length">
        <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="reply-item"
        >
          <UserAvatar :size="32" :src="reply.userAvatar" :seed="reply.userId || reply.userName" />
          <div class="reply-content">
            <div class="reply-header">
              <span class="reply-author">{{ reply.userName }}</span>
              <span v-if="reply.replyToUserName" class="reply-to">
                回复 @{{ reply.replyToUserName }}
              </span>
              <span class="reply-time">{{ reply.createTime }}</span>
            </div>
            <p class="reply-text">{{ reply.content }}</p>
          </div>
        </div>
      </div>

      <div class="comment-actions">
        <span
          :class="['action-btn', { active: comment.isLiked }]"
          @click="handleLike"
        >
          <el-icon><Star /></el-icon>
          {{ comment.likeCount > 0 ? comment.likeCount : '点赞' }}
        </span>
        <span class="action-btn" @click="showReplyInput = !showReplyInput">
          <el-icon><ChatDotRound /></el-icon>
          回复
        </span>
        <span
          v-if="canDelete"
          class="action-btn delete"
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </span>
      </div>

      <!-- 回复输入框 -->
      <div class="reply-input" v-if="showReplyInput">
        <el-input
          v-model="replyText"
          :rows="2"
          type="textarea"
          :placeholder="`回复 ${comment.userName}...`"
          maxlength="500"
        />
        <div class="reply-actions">
          <el-button size="small" @click="showReplyInput = false">取消</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleReply"
            :loading="replying"
          >
            发布
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Star, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import UserAvatar from '../../../components/UserAvatar.vue';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['reply', 'like', 'delete'])

const userStore = useUserStore()
const showReplyInput = ref(false)
const replyText = ref('')
const replying = ref(false)

// 是否可以删除（自己的评论）
const canDelete = computed(() => {
  return userStore.userInfo?.id === props.comment.userId
})

// 点赞
const handleLike = () => {
  emit('like', props.comment)
}

// 回复
const handleReply = async () => {
  if (!replyText.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replying.value = true
  try {
    await emit('reply', {
      comment: props.comment,
      content: replyText.value
    })
    replyText.value = ''
    showReplyInput.value = false
  } finally {
    replying.value = false
  }
}

// 删除
const handleDelete = () => {
  emit('delete', props.comment)
}
</script>

<style lang="scss" scoped>
.comment-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .comment-content {
    flex: 1;

    .comment-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .comment-author {
        font-weight: 600;
        font-size: 15px;
      }

      .comment-time {
        font-size: 13px;
        color: #999;
      }
    }

    .comment-text {
      margin-bottom: 12px;
      line-height: 1.6;
      font-size: 15px;
    }

    .comment-replies {
      background: var(--wd-silver-soft);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;

      .reply-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .reply-content {
          flex: 1;

          .reply-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 14px;

            .reply-author {
              font-weight: 600;
            }

            .reply-to {
              color: var(--wd-brand);
            }

            .reply-time {
              color: #999;
              font-size: 12px;
            }
          }

          .reply-text {
            font-size: 14px;
            line-height: 1.5;
          }
        }
      }
    }

    .comment-actions {
      display: flex;
      gap: 24px;
      font-size: 14px;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: #999;
        transition: color 0.3s;
        user-select: none;

        &:hover {
          color: var(--wd-brand);
        }

        &.active {
          color: #f56c6c;
        }

        &.delete:hover {
          color: #f56c6c;
        }
      }
    }

    .reply-input {
      margin-top: 12px;
      padding: 12px;
      background: var(--wd-silver-soft);
      border-radius: 8px;

      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 12px;
      }
    }
  }
}
</style>

