import { ModuleConfig } from '@cool-midway/core';

/**
 * 搜索模块
 */
export default () => {
  return {
    name: '搜索模块',
    description: '搜索历史与热搜',
    middlewares: [],
    globalMiddlewares: [],
    order: 0,
  } as ModuleConfig;
};
