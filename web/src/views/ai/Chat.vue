<template>
  <div class="ai-chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="chat-header">
          <h2>🤖 乌东智能助手</h2>
          <p>我可以帮你了解乌东的景点、美食、住宿等信息</p>
        </div>
      </template>

      <div class="chat-content" ref="chatContent">
        <div v-if="messages.length === 0" class="empty-state">
          <el-icon :size="60" color="#409EFF"><ChatDotRound /></el-icon>
          <p>开始对话，了解更多乌东信息</p>
          <div class="suggestions">
            <el-tag
              v-for="(suggestion, index) in suggestions"
              :key="index"
              @click="sendMessage(suggestion)"
              style="cursor: pointer; margin: 5px;"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-item', msg.role]"
          >
            <div class="message-avatar">
              <el-avatar v-if="msg.role === 'user'" :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar v-else :size="40" style="background-color: #409EFF;">
                <el-icon><Service /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>

          <div v-if="loading" class="message-item assistant">
            <div class="message-avatar">
              <el-avatar :size="40" style="background-color: #409EFF;">
                <el-icon><Service /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入你的问题..."
          @keydown.enter.prevent="handleEnter"
          :disabled="loading"
        />
        <el-button
          type="primary"
          @click="handleSend"
          :loading="loading"
          :disabled="!inputMessage.trim()"
        >
          发送
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ChatDotRound, User, Service } from '@element-plus/icons-vue';
import request from '@/api/request';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const loading = ref(false);
const chatContent = ref<HTMLElement | null>(null);
const conversationId = ref<string>('');

const suggestions = [
  '乌东有哪些著名景点？',
  '推荐乌东的特色美食',
  '乌东的住宿有什么推荐？',
  '乌东有什么特色文化？'
];

onMounted(() => {
  // 生成唯一对话 ID
  conversationId.value = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  loadHistory();
});

const loadHistory = async () => {
  try {
    const data = await request.get(`/ai/conversations/${conversationId.value}/messages`);
    if (data && Array.isArray(data)) {
      messages.value = data;
      scrollToBottom();
    }
  } catch (error) {
    // 新对话，没有历史记录
  }
};

const sendMessage = async (content: string) => {
  if (!content.trim()) return;

  const userMessage: Message = {
    role: 'user',
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  messages.value.push(userMessage);
  inputMessage.value = '';
  loading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    const data: any = await request.post('/ai/chat', {
      message: content.trim(),
      conversationId: conversationId.value
    });

    if (data && data.message) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString()
      };
      messages.value.push(assistantMessage);
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'AI 服务暂时不可用，请稍后再试');
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const handleSend = () => {
  sendMessage(inputMessage.value);
};

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    handleSend();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight;
    }
  });
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.ai-chat-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.chat-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  text-align: center;
}

.chat-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.chat-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-state p {
  margin: 20px 0;
  font-size: 16px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 500px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease-in;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.user .message-content {
  align-items: flex-end;
}

.message-item.user .message-text {
  background-color: #409EFF;
  color: white;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-time {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #409EFF;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #EBEEF5;
}

.chat-input :deep(.el-textarea__inner) {
  resize: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
</style>
