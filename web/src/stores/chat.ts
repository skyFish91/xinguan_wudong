import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 页面与悬浮客服组件共享的开关状态。 */
export const useChat = defineStore('chat', () => {
  const chatOpen = ref(false);

  function openChat() {
    chatOpen.value = true;
  }

  function closeChat() {
    chatOpen.value = false;
  }

  return { chatOpen, openChat, closeChat };
});
