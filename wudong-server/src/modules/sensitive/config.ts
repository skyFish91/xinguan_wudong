import { ModuleConfig } from '@cool-midway/core';

/**
 * 敏感词模块
 */
export default () => {
  return {
    name: '敏感词模块',
    description: '敏感词检测（本地词库）',
    middlewares: [],
    globalMiddlewares: [],
    order: 0,
  } as ModuleConfig;
};
