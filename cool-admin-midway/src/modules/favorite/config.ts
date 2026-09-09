import { ModuleConfig } from '@cool-midway/core';

/**
 * 收藏模块
 */
export default () => {
  return {
    name: '收藏模块',
    description: '统一收藏（多态 targetType）',
    middlewares: [],
    globalMiddlewares: [],
    order: 0,
  } as ModuleConfig;
};
