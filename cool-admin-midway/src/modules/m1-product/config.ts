import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 板块一·衣（非遗商品）
 *
 * 后端目录归属：m1-product
 * 表前缀：prd_
 * 错误码号段：30000–39999
 */
export default () => {
  return {
    name: '板块一·衣（非遗商品）',
    description: '板块一·衣（非遗商品）（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
