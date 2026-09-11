<template>
  <div class="customer-service">
    <!-- 客服按钮 -->
    <div
      v-if="!showChat"
      ref="serviceBtnRef"
      class="service-btn"
      :class="{ dragging: isDragging }"
      :style="{
        left: btnPosition.x + 'px',
        top: btnPosition.y + 'px'
      }"
      @click="openChat"
      @mousedown="handleMouseDown"
    >
      <el-icon class="icon"><ChatDotRound /></el-icon>
      <span class="text">在线客服</span>
      <div v-if="unreadCount > 0" class="badge">{{ unreadCount }}</div>
    </div>

    <!-- 聊天窗口 -->
    <transition name="slide-up">
      <div v-if="showChat" class="chat-window">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-left">
            <el-avatar :size="36" src="https://api.dicebear.com/7.x/bottts/svg?seed=ai">
              🤖
            </el-avatar>
            <div class="header-info">
              <div class="title">智能客服小乌</div>
              <div class="status">
                <span class="dot"></span>
                在线
              </div>
            </div>
          </div>
          <div class="header-actions">
            <el-button circle size="small" @click="minimizeChat">
              <el-icon><Minus /></el-icon>
            </el-button>
            <el-button circle size="small" @click="closeChat">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 聊天内容 -->
        <div ref="chatContent" class="chat-content">
          <div v-for="msg in messages" :key="msg.id" class="message-item" :class="{ self: msg.type === 'user' }">
            <el-avatar v-if="msg.type === 'ai'" :size="32" class="avatar">
              🤖
            </el-avatar>
            <div class="message-bubble" :class="msg.type">
              <div class="message-text" v-html="msg.content"></div>
              <div class="message-time">{{ msg.time }}</div>
            </div>
            <el-avatar v-if="msg.type === 'user'" :size="32" class="avatar">
              {{ userStore.userInfo?.username?.charAt(0) || '游' }}
            </el-avatar>
          </div>

          <!-- 加载中 -->
          <div v-if="isTyping" class="message-item">
            <el-avatar :size="32" class="avatar">🤖</el-avatar>
            <div class="message-bubble ai typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- 快捷回复 -->
        <div v-if="quickReplies.length > 0" class="quick-replies">
          <div
            v-for="(reply, idx) in quickReplies"
            :key="idx"
            class="quick-reply-btn"
            @click="sendQuickReply(reply)"
          >
            {{ reply }}
          </div>
        </div>

        <!-- 输入框 -->
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            :disabled="isTyping"
          >
            <template #append>
              <el-button @click="sendMessage" :disabled="!inputMessage.trim() || isTyping">
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ChatDotRound, Minus, Close } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useChat } from '@/stores/chat'

const userStore = useUserStore()
const chatStore = useChat()
const { chatOpen } = storeToRefs(chatStore)

const showChat = ref(false)

// 监听全局状态
watch(chatOpen, (newVal) => {
  showChat.value = newVal
})

// 拖拽相关
const serviceBtnRef = ref<HTMLElement>()
const isDragging = ref(false)
const btnPosition = ref({ x: 0, y: 0 })

let startX = 0
let startY = 0
let initialX = 0
let initialY = 0
const unreadCount = ref(0)
const inputMessage = ref('')
const isTyping = ref(false)
const chatContent = ref()

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
  time: string
}

// 先定义辅助函数
function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const messages = ref<Message[]>([
  {
    id: 1,
    type: 'ai',
    content: '您好！我是智能客服小乌 🤖<br/>有什么可以帮助您的吗？',
    time: getCurrentTime()
  }
])

const quickReplies = ref([
  '景区开放时间',
  '门票价格',
  '订票流程',
  '退改政策',
  '联系人工客服'
])

// 知识库
const knowledgeBase: Record<string, string> = {
  '你好': '您好！我是智能客服小乌，很高兴为您服务！',
  '开放时间': '大部分景区的开放时间是 08:00-18:00，具体时间请查看景区详情页面。',
  '景区开放时间': '大部分景区的开放时间是 08:00-18:00，具体时间请查看景区详情页面。',
  '门票': '门票价格根据景区和票种不同而有所差异，您可以在景区详情页查看具体价格。我们提供成人票、学生票、儿童票等多种票种。',
  '门票价格': '门票价格根据景区和票种不同而有所差异，您可以在景区详情页查看具体价格。我们提供成人票、学生票、儿童票等多种票种。',
  '订票': '订票流程：<br/>1. 选择景区和票种<br/>2. 选择游玩日期<br/>3. 填写游客信息<br/>4. 完成支付<br/>5. 收到电子票',
  '订票流程': '订票流程：<br/>1. 选择景区和票种<br/>2. 选择游玩日期<br/>3. 填写游客信息<br/>4. 完成支付<br/>5. 收到电子票',
  '退票': '退改政策：<br/>• 未使用的门票可在游玩日期前1天申请退款<br/>• 退款金额为订单金额的90%<br/>• 已使用的门票不支持退款',
  '退改政策': '退改政策：<br/>• 未使用的门票可在游玩日期前1天申请退款<br/>• 退款金额为订单金额的90%<br/>• 已使用的门票不支持退款',
  '支付': '我们支持微信支付、支付宝、银联等多种支付方式，支付安全可靠。',
  '人工': '正在为您转接人工客服，请稍候...<br/>人工客服电话：400-123-4567',
  '联系人工客服': '正在为您转接人工客服，请稍候...<br/>人工客服电话：400-123-4567',
  '西江': '西江千户苗寨是中国最大的苗族聚居村寨，被誉为"苗族露天博物馆"。夜景非常漂亮，建议住一晚体验！',
  '推荐': '我为您推荐几个热门景区：<br/>• 西江千户苗寨 - 最美苗寨<br/>• 荔波小七孔 - 地球腰带上的绿宝石<br/>• 镇远古城 - 山水古城<br/>您对哪个感兴趣呢？'
}

function openChat() {
  if (!isDragging.value) {
    showChat.value = true
    chatOpen.value = true
  }
}

function minimizeChat() {
  showChat.value = false
  chatOpen.value = false
}

function closeChat() {
  showChat.value = false
  chatOpen.value = false
}

// 拖拽处理
function handleMouseDown(e: MouseEvent) {
  if (showChat.value) return // 聊天窗口打开时不允许拖拽按钮

  isDragging.value = false
  startX = e.clientX
  startY = e.clientY
  initialX = btnPosition.value.x
  initialY = btnPosition.value.y

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  e.preventDefault()
}

function handleMouseMove(e: MouseEvent) {
  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY

  // 移动超过 5px 才算拖拽（避免点击时误触发）
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isDragging.value = true
  }

  if (isDragging.value) {
    const newX = initialX + deltaX
    const newY = initialY + deltaY

    // 限制在屏幕范围内
    const maxX = window.innerWidth - 120
    const maxY = window.innerHeight - 50

    btnPosition.value.x = Math.max(0, Math.min(newX, maxX))
    btnPosition.value.y = Math.max(0, Math.min(newY, maxY))
  }
}

function handleMouseUp() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 延迟重置 isDragging，避免拖拽结束时触发点击
  setTimeout(() => {
    isDragging.value = false
  }, 50)
}

onMounted(() => {
  // 初始位置：右下角
  btnPosition.value = {
    x: window.innerWidth - 150,
    y: window.innerHeight - 80
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

function scrollToBottom() {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const text = inputMessage.value.trim()
  if (!text) return

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    type: 'user',
    content: text,
    time: getCurrentTime()
  })

  inputMessage.value = ''
  scrollToBottom()

  // AI 思考中
  isTyping.value = true

  // 模拟 AI 响应延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  // 智能匹配回复
  let reply = getAIResponse(text)

  // 添加 AI 消息
  messages.value.push({
    id: Date.now() + 1,
    type: 'ai',
    content: reply,
    time: getCurrentTime()
  })

  isTyping.value = false
  scrollToBottom()
}

function getAIResponse(userInput: string): string {
  const input = userInput.toLowerCase()

  // 精确匹配
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (input.includes(key)) {
      return value
    }
  }

  // 关键词匹配
  if (input.includes('价格') || input.includes('多少钱') || input.includes('费用')) {
    return knowledgeBase['门票价格']
  }

  if (input.includes('时间') || input.includes('几点')) {
    return knowledgeBase['景区开放时间']
  }

  if (input.includes('怎么') || input.includes('如何') || input.includes('流程')) {
    return knowledgeBase['订票流程']
  }

  if (input.includes('退') || input.includes('改') || input.includes('取消')) {
    return knowledgeBase['退改政策']
  }

  if (input.includes('人工') || input.includes('客服') || input.includes('电话')) {
    return knowledgeBase['联系人工客服']
  }

  // 默认回复
  return '抱歉，我暂时无法理解您的问题。您可以：<br/>• 尝试换个方式描述<br/>• 点击下方的快捷问题<br/>• 联系人工客服：400-123-4567'
}

function sendQuickReply(reply: string) {
  inputMessage.value = reply
  sendMessage()
}

onMounted(() => {
  // 可以在这里添加欢迎消息或加载历史记录
})
</script>

<style scoped>
.customer-service {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.customer-service > * {
  pointer-events: auto;
}

.service-btn {
  position: fixed;
  width: 120px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: move;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: box-shadow 0.3s, transform 0.3s;
  user-select: none;
}

.service-btn:hover {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
}

.service-btn.dragging {
  cursor: grabbing;
  transform: scale(1.05);
}

.service-btn .icon {
  font-size: 22px;
}

.service-btn .text {
  font-size: 15px;
  font-weight: 600;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.chat-window {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-info {
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}

.status .dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f7fafc;
}

.message-item {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-bubble.ai {
  background: white;
}

.message-bubble.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  margin-top: 6px;
}

.message-bubble.typing {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
}

.message-bubble.typing .dot {
  width: 8px;
  height: 8px;
  background: #cbd5e0;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.message-bubble.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.message-bubble.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.quick-replies {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-reply-btn {
  padding: 8px 16px;
  background: #f7fafc;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-reply-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chat-input {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
