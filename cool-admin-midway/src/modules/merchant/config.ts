import { ModuleConfig } from '@cool-midway/core';

/**
 * 商家模块
 */
export default () => {
  return {
    name: '商家模块',
    description: '商家/商户体系与数据隔离',
    middlewares: [],
    globalMiddlewares: [],
    order: 0,
  } as ModuleConfig;
};
