import { ModuleConfig } from '@cool-midway/core';

/**
 * 统一支付模块
 */
export default () => {
  return {
    name: '支付模块',
    description: '统一支付（PayProvider 抽象 + mock 默认）',
    middlewares: [],
    globalMiddlewares: [],
    order: 10,
  } as ModuleConfig;
};
