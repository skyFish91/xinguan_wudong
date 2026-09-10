import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { AiChatService, ChatMessage } from '../service/chat.service';

@Controller('/ai')
export class AiChatController {
  @Inject()
  aiChatService: AiChatService;

  /**
   * 智能客服对话
   * body: { message: string, history?: [{ role, content }] }
   */
  @Post('/chat')
  async chat(@Body() body: { message?: string; history?: ChatMessage[] }) {
    const message = String(body?.message || '').trim();

    if (!message) {
      return { code: 60101, message: '消息内容不能为空', data: null };
    }

    if (message.length > 500) {
      return { code: 60102, message: '消息内容过长，请精简后再发送', data: null };
    }

    try {
      const reply = await this.aiChatService.chat(message, body?.history || []);
      return { code: 0, message: 'success', data: { reply } };
    } catch (err: any) {
      const msg = String(err?.message || '');

      // 未配置 Key：让前端回退到本地知识库
      if (msg === 'AI_NOT_CONFIGURED') {
        return { code: 60103, message: 'AI 服务未配置', data: null };
      }

      // 其他错误只回通用提示，不把上游报错细节透给前端
      console.error('[AI chat error]', msg);
      return { code: 60104, message: 'AI 服务暂时不可用', data: null };
    }
  }
}
