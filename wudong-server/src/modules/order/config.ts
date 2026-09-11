import { ModuleConfig } from '@cool-midway/core';

/**
 * 统一订单中心模块
 */
export default () => {
  return {
    name: '订单模块',
    description: '统一订单中心（状态机/退款/日志）',
    middlewares: [],
    globalMiddlewares: [],
    order: 10,
  } as ModuleConfig;
};
