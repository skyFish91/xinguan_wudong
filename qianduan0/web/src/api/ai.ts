import axios from 'axios';

/**
 * AI 助手专用请求实例
 *
 * 为什么不复用 @/api/request：
 * 那个实例会在业务码非 0 时弹全局 ElMessage 红条。聊天场景下报错应该
 * 显示在对话气泡里（还能重试），弹一个飘走的红条体验很差、也无法承载上下文。
 * 所以这里用独立实例，把错误交给调用方处理。
 */
const aiHttp = axios.create({ baseURL: '/api', timeout: 60000 });

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** 业务异常：带上后端错误码，调用方据此决定是降级还是提示重试 */
export class AiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'AiError';
    this.code = code;
  }

  /** 未配置 Key（后端 6011）：应当静默降级到本地知识库 */
  get isNotConfigured() {
    return this.code === 6011;
  }
}

/** 查询 AI 是否可用；失败一律当不可用处理，不打扰用户 */
export async function fetchAiEnabled(): Promise<boolean> {
  try {
    const { data } = await aiHttp.get('/ai/status');
    return !!data?.enabled;
  } catch {
    return false;
  }
}

/**
 * 发送消息并拿到回复
 * 后端成功时直接返回 { reply }（遵循全站「成功直返数据」约定）；
 * 出错时由全局过滤器包装成 { code, message, data }，且 HTTP 仍是 200，
 * 所以这里必须同时检查 response body 里的业务码。
 */
export async function sendAiMessage(message: string, history: AiChatMessage[] = []): Promise<string> {
  try {
    const { data } = await aiHttp.post('/ai/chat', { message, history });

    if (data && typeof data.code === 'number' && data.code !== 0) {
      throw new AiError(data.code, data.message || 'AI 服务异常');
    }

    const reply = data?.reply;
    if (!reply) {
      throw new AiError(-1, 'AI 没有返回内容');
    }

    return String(reply).trim();
  } catch (err: any) {
    if (err instanceof AiError) throw err;

    // HTTP 层错误（超时 / 断网 / 5xx）
    const status = err?.response?.status;
    const body = err?.response?.data;
    if (body && typeof body.code === 'number') {
      throw new AiError(body.code, body.message || 'AI 服务异常');
    }
    if (err?.code === 'ECONNABORTED' || /timeout/i.test(String(err?.message))) {
      throw new AiError(-1, 'AI 思考超时了，请再问一次');
    }
    if (status >= 500) {
      throw new AiError(-1, 'AI 服务暂时不可用，请稍后再试');
    }
    throw new AiError(-1, '网络连接失败，请检查网络后重试');
  }
}
