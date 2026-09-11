import { Controller, Post, Get, Body, Inject, Context } from '@midwayjs/core';
import { Context as KoaContext } from '@midwayjs/koa';
import { AiChatService, ChatMessage } from '../service/chat.service';
import { BizError } from '../../../common/BizError';
import { ErrorCode } from '../../../common/constants';

// 前缀必须是 /api/ai：与其余模块保持一致，且 auth.guard 的公开规则
// 是按 /api/ai/* 匹配的（写成 /ai 会导致路由绕过守卫规则、且前端代理不到）
@Controller('/api/ai')
export class AiChatController {
  @Inject()
  aiChatService: AiChatService;

  @Inject()
  ctx: KoaContext;

  /**
   * 简易内存限流：AI 接口是公开的（游客也能问），
   * 但每次调用都要花 Key 的钱，不限流会被脚本刷爆。
   * 按 IP 计数，单窗口 60 秒最多 20 次 —— 正常用户不可能触发。
   * 进程内存储即可：本平台单实例部署，无需引入 Redis。
   */
  private static hits = new Map<string, { count: number; resetAt: number }>();

  private checkRateLimit() {
    const ip =
      String(this.ctx?.ip || '').trim() ||
      String(this.ctx?.headers['x-forwarded-for'] || 'unknown');
    const now = Date.now();
    const rec = AiChatController.hits.get(ip);

    if (!rec || rec.resetAt <= now) {
      AiChatController.hits.set(ip, { count: 1, resetAt: now + 60_000 });
      // 顺手清理过期记录，避免 Map 无限增长
      if (AiChatController.hits.size > 500) {
        for (const [k, v] of AiChatController.hits) {
          if (v.resetAt <= now) {
            AiChatController.hits.delete(k);
          }
        }
      }
      return;
    }

    if (rec.count >= 20) {
      throw BizError.biz('提问太频繁了，请稍等一分钟再问');
    }
    rec.count += 1;
  }

  /**
   * AI 助手可用状态：前端用它决定是走真实 AI 还是本地知识库兜底
   */
  @Get('/status')
  async status() {
    return { enabled: this.aiChatService.isConfigured() };
  }

  /**
   * 智能客服对话
   * body: { message: string, history?: [{ role, content }] }
   *
   * 响应遵循全站约定：成功直接返回 data，失败抛 BizError 由全局过滤器包装
   */
  @Post('/chat')
  async chat(@Body() body: { message?: string; history?: ChatMessage[] }) {
    const message = String(body?.message || '').trim();

    if (!message) {
      throw BizError.param('消息内容不能为空');
    }

    if (message.length > 500) {
      throw BizError.param('消息内容过长，请精简后再发送（500 字以内）');
    }

    this.checkRateLimit();

    try {
      const reply = await this.aiChatService.chat(message, body?.history || []);
      return { reply };
    } catch (err: any) {
      const msg = String(err?.message || '');

      // 未配置 Key：用独立错误码，前端据此静默降级到本地知识库，不弹红条
      if (msg === 'AI_NOT_CONFIGURED') {
        throw new BizError(ErrorCode.AI_NOT_CONFIGURED, 'AI 助手尚未配置');
      }

      // 其他错误只回通用提示，不把上游报错细节透给前端
      console.error('[AI chat error]', msg);
      throw new BizError(ErrorCode.AI_UNAVAILABLE, 'AI 服务暂时不可用，请稍后再试');
    }
  }
}
