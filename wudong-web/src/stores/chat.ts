import { ref } from 'vue'

// 客服窗口的全局开关，供页面任意位置调用
const chatOpen = ref(false)

export function useChat() {
  function openChat() {
    chatOpen.value = true
  }

  function closeChat() {
    chatOpen.value = false
  }

  return {
    chatOpen,
    openChat,
    closeChat
  }
}
