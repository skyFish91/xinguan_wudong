import { ModuleConfig } from '@cool-midway/core';

/**
 * 消息模块
 */
export default () => {
  return {
    name: '消息模块',
    description: '站内消息（系统/订单/互动）',
    middlewares: [],
    globalMiddlewares: [],
    order: 0,
  } as ModuleConfig;
};
