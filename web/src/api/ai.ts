import request from './request';

export interface ChatMessage {
  message: string;
  conversationId: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  messageId: string;
}

export interface Conversation {
  id: number;
  conversationId: string;
  userId?: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/**
 * 发送聊天消息
 */
export const sendChatMessage = (data: ChatMessage) => {
  return request.post<ChatResponse>('/ai/chat', data);
};

/**
 * 获取对话列表
 */
export const getConversations = () => {
  return request.get<Conversation[]>('/ai/conversations');
};

/**
 * 获取对话消息历史
 */
export const getConversationMessages = (conversationId: string) => {
  return request.get<Message[]>(`/ai/conversations/${conversationId}/messages`);
};

/**
 * 删除对话
 */
export const deleteConversation = (conversationId: string) => {
  return request.delete(`/ai/conversations/${conversationId}`);
};
