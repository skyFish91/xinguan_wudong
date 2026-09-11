<template>
  <!-- 面板 -->
  <transition name="ai-pop">
    <section v-if="open" class="ai-panel" role="dialog" aria-label="AI 智能助手">
      <header class="ai-head">
        <CartoonAvatar seed="xiaowu-assistant" :size="40" />
        <div class="ai-head-text">
          <div class="ai-name">
            小乌
            <span class="ai-tag">AI 助手</span>
          </div>
          <div class="ai-sub">
            <i class="ai-dot" :class="{ 'is-on': enabled !== false }" />
            {{ statusText }}
          </div>
        </div>
        <button class="ai-icon-btn" type="button" aria-label="收起助手" @click="open = false">
          <el-icon><Minus /></el-icon>
        </button>
      </header>

      <div ref="listEl" class="ai-list">
        <div class="ai-intro">
          <p class="ai-intro-title">你好，我是小乌 👋</p>
          <p class="ai-intro-desc">
            乌东文旅的在线客服。景区票价、路线行程、怎么过去，都可以问我。
          </p>
        </div>

        <div v-for="(m, i) in messages" :key="i" class="ai-row" :class="`is-${m.role}`">
          <CartoonAvatar v-if="m.role === 'assistant'" seed="xiaowu-assistant" :size="30" />
          <div class="ai-bubble-wrap">
            <div class="ai-bubble">
              <p v-for="(line, li) in lines(m.content)" :key="li">{{ line }}</p>
            </div>
            <div v-if="m.role === 'assistant'" class="ai-bubble-foot">
              <span v-if="m.source === 'faq'" class="ai-src">离线知识库</span>
              <button v-if="m.retry" class="ai-retry" type="button" @click="retry(i)">
                重试
              </button>
            </div>
          </div>
          <UserAvatar v-if="m.role === 'user'" :seed="userSeed" :size="30" />
        </div>

        <!-- 思考中 -->
        <div v-if="pending" class="ai-row is-assistant">
          <CartoonAvatar seed="xiaowu-assistant" :size="30" />
          <div class="ai-bubble ai-typing" aria-label="正在思考">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <div v-if="messages.length === 0" class="ai-chips">
        <button
          v-for="q in QUICK_QUESTIONS"
          :key="q"
          class="ai-chip"
          type="button"
          @click="ask(q)"
        >
          {{ q }}
        </button>
      </div>

      <footer class="ai-input">
        <textarea
          v-model="draft"
          class="ai-textarea"
          rows="1"
          maxlength="500"
          placeholder="问点什么…（Enter 发送，Shift+Enter 换行）"
          @keydown.enter.exact.prevent="submit()"
        />
        <button
          class="ai-send"
          type="button"
          :disabled="!draft.trim() || pending"
          aria-label="发送"
          @click="submit()"
        >
          <el-icon><Promotion /></el-icon>
        </button>
      </footer>
    </section>
  </transition>

  <!-- 悬浮入口 -->
  <button
    class="ai-fab"
    type="button"
    :aria-expanded="open"
    :aria-label="open ? '收起 AI 助手' : '打开 AI 助手'"
    @click="open = !open"
  >
    <el-icon :size="22"><Close v-if="open" /><ChatDotRound v-else /></el-icon>
    <span class="ai-fab-label">AI 助手</span>
  </button>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { ChatDotRound, Close, Minus, Promotion } from '@element-plus/icons-vue';
import CartoonAvatar from './CartoonAvatar.vue';
import UserAvatar from './UserAvatar.vue';
import { AiError, fetchAiEnabled, sendAiMessage, type AiChatMessage } from '@/api/ai';
import { FALLBACK_TIP, matchFaq } from '@/data/ai-fallback';

interface Bubble extends AiChatMessage {
  /** faq = 本地知识库兜底回答，气泡上会标出来，避免用户误以为是 AI 说的 */
  source?: 'ai' | 'faq';
  /** 这条失败时挂上重试入口 */
  retry?: boolean;
}

const QUICK_QUESTIONS = [
  '有哪些景区？门票多少钱？',
  '门票怎么退？',
  '一日游线路包含什么？',
  '从贵阳怎么过去？',
];

const STORAGE_KEY = 'wd-ai-chat';
const MAX_KEEP = 30;

const open = ref(false);
const draft = ref('');
const pending = ref(false);
/** null = 还没探测出来，先按可用处理，避免首屏闪一下「离线」 */
const enabled = ref<boolean | null>(null);
const messages = ref<Bubble[]>([]);
const listEl = ref<HTMLElement | null>(null);

const statusText = computed(() => {
  if (enabled.value === null) return '正在连接…';
  return enabled.value ? '在线，随时为你服务' : '离线知识库模式';
});

/** 用户头像种子取自登录信息，未登录则用固定值 */
const userSeed = computed(() => {
  try {
    const raw = localStorage.getItem('userInfo');
    const info = raw ? JSON.parse(raw) : null;
    return String(info?.id || info?.nickname || 'guest');
  } catch {
    return 'guest';
  }
});

/** 按换行拆段渲染，避免整块文字挤成一坨 */
function lines(text: string): string[] {
  return String(text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function scrollToBottom() {
  nextTick(() => {
    const el = listEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

/** 会话存 sessionStorage：换页面不丢，关掉标签页自动清 */
function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value.slice(-MAX_KEEP)));
  } catch {
    /* 隐私模式下写不了，忽略即可 */
  }
}

function restore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      messages.value = arr.filter(m => m && typeof m.content === 'string');
    }
  } catch {
    /* 脏数据直接丢弃 */
  }
}

/** 本地知识库应答 */
function answerLocally(question: string, hint = false): string {
  const hit = matchFaq(question);
  if (hit) return hit;
  return hint ? `${FALLBACK_TIP}` : FALLBACK_TIP;
}

async function ask(question: string) {
  const text = question.trim();
  if (!text || pending.value) return;

  messages.value.push({ role: 'user', content: text });
  draft.value = '';
  save();
  scrollToBottom();

  // 已知 AI 不可用：直接走本地库，不发请求
  if (enabled.value === false) {
    messages.value.push({ role: 'assistant', content: answerLocally(text), source: 'faq' });
    save();
    scrollToBottom();
    return;
  }

  pending.value = true;
  scrollToBottom();

  // 只带最近 8 轮，控制 token
  const history: AiChatMessage[] = messages.value
    .slice(0, -1)
    .slice(-8)
    .map(m => ({ role: m.role, content: m.content }));

  try {
    const reply = await sendAiMessage(text, history);
    messages.value.push({ role: 'assistant', content: reply, source: 'ai' });
  } catch (err) {
    const e = err as AiError;

    // 未配置 Key：静默降级到本地知识库，不当作错误
    if (e instanceof AiError && e.isNotConfigured) {
      enabled.value = false;
      messages.value.push({ role: 'assistant', content: answerLocally(text), source: 'faq' });
    } else {
      messages.value.push({
        role: 'assistant',
        content: e?.message || '出了点问题，请稍后再试',
        source: 'ai',
        retry: true,
      });
    }
  } finally {
    pending.value = false;
    save();
    scrollToBottom();
  }
}

function submit() {
  if (!draft.value.trim() || pending.value) return;
  ask(draft.value);
}

/** 重试：删掉失败的回复，用同一条提问重发 */
function retry(index: number) {
  const failed = messages.value[index];
  const question = messages.value[index - 1];
  if (!failed?.retry || !question || question.role !== 'user') return;
  messages.value.splice(index - 1, 2);
  ask(question.content);
}

onMounted(async () => {
  restore();
  enabled.value = await fetchAiEnabled();
  scrollToBottom();
});

// 首次展开时滚到底部，历史很长时不会停在中间
watch(open, v => {
  if (v) scrollToBottom();
});
</script>

<style scoped>
/* ---------------- 悬浮入口 ---------------- */
.ai-fab {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 900;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 0 20px 0 17px;
  border: 0;
  border-radius: var(--wd-r-pill);
  background: linear-gradient(135deg, var(--wd-brand-400), var(--wd-brand));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--wd-sh-brand);
  transition: transform 0.28s var(--wd-ease), box-shadow 0.28s var(--wd-ease);
}
.ai-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(var(--wd-brand-rgb), 0.34);
}
.ai-fab:active {
  transform: translateY(0);
}
.ai-fab-label {
  white-space: nowrap;
}

/* ---------------- 面板 ---------------- */
.ai-panel {
  position: fixed;
  right: 28px;
  bottom: 92px;
  z-index: 901;
  display: flex;
  flex-direction: column;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 560px;
  max-height: calc(100vh - 140px);
  overflow: hidden;
  border: 1px solid var(--wd-border);
  border-radius: var(--wd-r-xl);
  background: var(--wd-surface);
  box-shadow: var(--wd-sh-3);
}

.ai-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 14px 18px;
  border-bottom: 1px solid var(--wd-border);
  background: linear-gradient(180deg, var(--wd-brand-soft), var(--wd-surface));
}
.ai-head-text {
  flex: 1;
  min-width: 0;
}
.ai-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.ai-tag {
  padding: 1px 7px;
  border-radius: var(--wd-r-pill);
  background: var(--wd-brand-tint);
  color: var(--wd-brand);
  font-size: 11px;
  font-weight: 600;
}
.ai-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  font-size: 12px;
  color: var(--wd-text-3);
}
.ai-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wd-text-4);
}
.ai-dot.is-on {
  background: #1e7a45;
}

.ai-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--wd-text-3);
  cursor: pointer;
  transition: background 0.2s var(--wd-ease), color 0.2s var(--wd-ease);
}
.ai-icon-btn:hover {
  background: var(--wd-brand-tint);
  color: var(--wd-brand);
}

/* ---------------- 消息区 ---------------- */
.ai-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--wd-s5) var(--wd-s4) var(--wd-s4);
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--wd-bg);
}

.ai-intro {
  padding: 14px 16px;
  border: 1px solid var(--wd-brand-tint);
  border-radius: var(--wd-r-md);
  background: var(--wd-brand-soft);
}
.ai-intro-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--wd-brand);
}
.ai-intro-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--wd-text-2);
}

.ai-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.ai-row.is-user {
  justify-content: flex-end;
}
.ai-bubble-wrap {
  max-width: 78%;
  min-width: 0;
}
.ai-row.is-user .ai-bubble-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ai-bubble {
  padding: 10px 13px;
  border-radius: 4px var(--wd-r-md) var(--wd-r-md) var(--wd-r-md);
  background: var(--wd-surface);
  border: 1px solid var(--wd-border);
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--wd-text-1);
  word-break: break-word;
}
.ai-bubble p {
  margin: 0;
}
.ai-bubble p + p {
  margin-top: 6px;
}
.ai-row.is-user .ai-bubble {
  border-color: transparent;
  border-radius: var(--wd-r-md) 4px var(--wd-r-md) var(--wd-r-md);
  background: linear-gradient(135deg, var(--wd-brand-400), var(--wd-brand));
  color: #fff;
}

.ai-bubble-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}
.ai-src {
  font-size: 11px;
  color: var(--wd-text-4);
}
.ai-retry {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--wd-brand);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

/* 思考中：三点跳动 */
.ai-typing {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 14px 15px;
}
.ai-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wd-brand-300);
  animation: ai-bounce 1.2s infinite ease-in-out;
}
.ai-typing span:nth-child(2) {
  animation-delay: 0.15s;
}
.ai-typing span:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes ai-bounce {
  0%,
  70%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  35% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* ---------------- 快捷提问 ---------------- */
.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--wd-border);
  background: var(--wd-surface);
}
.ai-chip {
  padding: 6px 12px;
  border: 1px solid var(--wd-border-strong);
  border-radius: var(--wd-r-pill);
  background: var(--wd-surface);
  color: var(--wd-text-2);
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.22s var(--wd-ease);
}
.ai-chip:hover {
  border-color: var(--wd-brand-300);
  background: var(--wd-brand-soft);
  color: var(--wd-brand);
}

/* ---------------- 输入区 ---------------- */
.ai-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px 14px;
  border-top: 1px solid var(--wd-border);
  background: var(--wd-surface);
}
.ai-textarea {
  flex: 1;
  max-height: 88px;
  padding: 10px 14px;
  border: 1px solid var(--wd-border-strong);
  border-radius: var(--wd-r-md);
  background: var(--wd-bg);
  color: var(--wd-text-1);
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.2s var(--wd-ease), box-shadow 0.2s var(--wd-ease);
}
.ai-textarea:focus {
  border-color: var(--wd-brand-300);
  background: var(--wd-surface);
  box-shadow: 0 0 0 3px rgba(var(--wd-brand-rgb), 0.1);
}
.ai-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: var(--wd-r-md);
  background: linear-gradient(135deg, var(--wd-brand-400), var(--wd-brand));
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s var(--wd-ease), transform 0.2s var(--wd-ease);
}
.ai-send:hover:not(:disabled) {
  transform: translateY(-1px);
}
.ai-send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ---------------- 面板弹出 ---------------- */
.ai-pop-enter-active {
  transition: opacity 0.26s var(--wd-ease), transform 0.32s var(--wd-ease);
}
.ai-pop-leave-active {
  transition: opacity 0.16s ease-out, transform 0.18s ease-out;
}
.ai-pop-enter-from,
.ai-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

/* ---------------- 窄屏：铺满可用宽度 ---------------- */
@media (max-width: 640px) {
  .ai-fab {
    right: 16px;
    bottom: 16px;
    height: 48px;
    padding: 0 16px;
  }
  .ai-fab-label {
    display: none;
  }
  .ai-panel {
    right: 12px;
    left: 12px;
    bottom: 76px;
    width: auto;
    height: auto;
    max-height: calc(100vh - 120px);
  }
  .ai-bubble-wrap {
    max-width: 84%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-fab,
  .ai-chip,
  .ai-send,
  .ai-pop-enter-active,
  .ai-pop-leave-active {
    transition-duration: 0.01ms !important;
  }
  .ai-typing span {
    animation-duration: 0.01ms !important;
  }
}
</style>
