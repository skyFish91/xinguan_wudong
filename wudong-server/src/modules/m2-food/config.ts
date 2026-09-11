import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 板块二·食（餐饮与农特产）
 *
 * 后端目录归属：m2-food
 * 表前缀：food_ farm_
 * 错误码号段：40000–49999
 */
export default () => {
  return {
    name: '板块二·食（餐饮与农特产）',
    description: '板块二·食（餐饮与农特产）（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
