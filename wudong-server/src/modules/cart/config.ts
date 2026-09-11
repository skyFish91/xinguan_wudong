import { ModuleConfig } from '@cool-midway/core';

/**
 * 统一购物车模块
 */
export default () => {
  return {
    name: '购物车模块',
    description: '统一购物车（仅衣商品与食特产进车）',
    middlewares: [],
    globalMiddlewares: [],
    order: 10,
  } as ModuleConfig;
};
