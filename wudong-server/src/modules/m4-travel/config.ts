import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 板块四·行（景区与线路）
 *
 * 后端目录归属：m4-travel
 * 表前缀：tvl_
 * 错误码号段：60000–69999
 */
export default () => {
  return {
    name: '板块四·行（景区与线路）',
    description: '板块四·行（景区与线路）（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
