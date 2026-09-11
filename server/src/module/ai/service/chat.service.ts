import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import {
  ScenicEntity,
  TicketTypeEntity,
  RouteEntity,
  TrafficGuideEntity,
} from '../../../entity/travel.entity';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Provide()
export class AiChatService {
  @InjectEntityModel(ScenicEntity)
  scenicRepo: Repository<ScenicEntity>;

  @InjectEntityModel(TicketTypeEntity)
  ticketTypeRepo: Repository<TicketTypeEntity>;

  @InjectEntityModel(RouteEntity)
  routeRepo: Repository<RouteEntity>;

  @InjectEntityModel(TrafficGuideEntity)
  trafficRepo: Repository<TrafficGuideEntity>;

  // 平台数据缓存，避免每次对话都查库
  private contextCache: { text: string; expireAt: number } | null = null;

  /**
   * AI 是否已配置（前端据此决定走真实 AI 还是本地知识库兜底）
   */
  isConfigured(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  /** 去掉富文本标签，只留纯文本喂给模型（详情字段里存的是 <p> 标签） */
  private stripHtml(html?: string | null): string {
    if (!html) return '';
    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** 金额：decimal 列在 mysql2 下按字符串返回，统一转成「元」的整数表述 */
  private yuan(v: unknown): string {
    const n = Number(v);
    return Number.isFinite(n) ? String(Math.round(n)) : '—';
  }

  /**
   * 从数据库拼装平台实时数据，作为 AI 的事实依据
   *
   * 注意：实体来自 src/entity/travel.entity.ts（真实表 t_scenic / t_ticket_type /
   * t_route / t_traffic_guide）。这些表**没有 deleted_at 列**，用 status = 1 过滤即可；
   * price 存的是「元」而非「分」，不要再除以 100。
   */
  async buildPlatformContext(): Promise<string> {
    const now = Date.now();
    if (this.contextCache && this.contextCache.expireAt > now) {
      return this.contextCache.text;
    }

    const [scenics, tickets, routes, traffics] = await Promise.all([
      this.scenicRepo.find({ where: { status: 1 }, order: { id: 'ASC' }, take: 30 }),
      this.ticketTypeRepo.find({ where: { status: 1 }, order: { id: 'ASC' }, take: 100 }),
      this.routeRepo.find({ where: { status: 1 }, order: { id: 'ASC' }, take: 20 }),
      this.trafficRepo.find({ where: { status: 1 }, order: { id: 'ASC' }, take: 20 }),
    ]);

    // 票种按景区归组，方便 AI 关联
    const ticketsByScenic = new Map<string, TicketTypeEntity[]>();
    for (const t of tickets) {
      const key = String(t.scenicId);
      if (!ticketsByScenic.has(key)) {
        ticketsByScenic.set(key, []);
      }
      ticketsByScenic.get(key).push(t);
    }

    const lines: string[] = [];

    lines.push(`## 景区列表（共 ${scenics.length} 个）`);
    for (const s of scenics) {
      lines.push(
        `- ${s.name}（id=${s.id}）｜地址：${s.address}｜开放时间：${s.openTime}｜简介：${this.stripHtml(s.intro) || '暂无'}`
      );
      const its = ticketsByScenic.get(String(s.id)) || [];
      if (its.length === 0) {
        lines.push('    · 暂未配置票种');
      }
      for (const t of its) {
        lines.push(`    · ${t.name}：${this.yuan(t.price)} 元｜${t.validRule}`);
      }
    }

    lines.push('');
    lines.push(`## 旅游路线（共 ${routes.length} 条）`);
    for (const r of routes) {
      lines.push(
        `- ${r.title}（id=${r.id}）｜${r.days} 天｜${this.yuan(r.price)} 元/人｜主题：${r.themes || '综合'}｜${r.departFrom} → ${r.dest}｜费用包含：${this.stripHtml(r.included) || '详见页面'}｜住宿标准：${r.hotelStandard || '—'}｜餐饮标准：${r.mealStandard || '—'}`
      );
    }

    lines.push('');
    lines.push(`## 交通攻略（共 ${traffics.length} 条）`);
    for (const g of traffics) {
      lines.push(
        `- ${g.departFrom} → ${g.dest}｜${g.transport}｜${g.duration || '耗时待查'}｜费用：${g.cost || '待查'}｜${this.stripHtml(g.detail)}`
      );
    }

    const text = lines.join('\n');

    // 缓存 5 分钟
    this.contextCache = { text, expireAt: now + 5 * 60 * 1000 };
    return text;
  }

  /**
   * 组装系统提示词
   */
  private buildSystemPrompt(platformContext: string): string {
    return [
      '你是「乌东文旅」平台的在线客服「小乌」，服务对象是准备去贵州黔东南旅游的游客。',
      '',
      '回答要求：',
      '1. 用简体中文，语气亲切自然，像真人客服，不要太机械。',
      '2. 回答简洁，一般 2-4 句话说清即可，除非用户要求详细介绍。',
      '3. 涉及景区名称、票价、开放时间、路线价格、交通费用时，**只能引用下方「平台数据」中的真实信息**，绝对不要凭空编造价格或时间。',
      '4. 如果「平台数据」里没有用户问的内容，就诚实说明暂无该信息，并建议用户查看对应页面或联系人工客服（电话 400-123-4567）。',
      '5. 票价、路线价格已在平台数据中标注为「元」，直接引用即可，不要换算、不要提及「分」。',
      '6. 用户闲聊（天气、心情、旅行建议等）时可以自然回应，但要适时把话题引回旅游服务。',
      '7. 如果用户问的是与旅游完全无关的专业问题（如写代码、做作业），礼貌说明你是旅游客服，帮不上这类问题。',
      '8. 不要使用 Markdown 语法（如 ** 或 ##），需要分行时直接换行。',
      '',
      '平台业务规则：',
      '- 订票流程：选择景区和票种 → 选择游玩日期 → 填写游客信息 → 完成支付 → 收到电子票。',
      '- 退改政策：未使用的门票可在游玩日期前 1 天申请退款，退款为订单金额的 90%；已使用的门票不支持退款。',
      '- 支付方式：支持微信支付、支付宝、银联。',
      '- 下单与订单查询需要先登录；游客可以直接浏览景区、路线、交通攻略。',
      '- 人工客服电话：400-123-4567。',
      '',
      '=== 平台数据（实时，来自数据库）===',
      platformContext,
      '=== 平台数据结束 ===',
    ].join('\n');
  }

  /**
   * 调用 DeepSeek 生成回复
   */
  async chat(userMessage: string, history: ChatMessage[] = []): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('AI_NOT_CONFIGURED');
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    const platformContext = await this.buildPlatformContext();

    // 只保留最近 8 条历史，控制 token 消耗
    const trimmedHistory = history.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 1000),
    }));

    const body = {
      model,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(platformContext) },
        ...trimmedHistory,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: false,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`DEEPSEEK_HTTP_${res.status}: ${errText.slice(0, 300)}`);
      }

      const data: any = await res.json();
      const reply = data?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error('DEEPSEEK_EMPTY_REPLY');
      }

      return String(reply).trim();
    } finally {
      clearTimeout(timeout);
    }
  }
}
