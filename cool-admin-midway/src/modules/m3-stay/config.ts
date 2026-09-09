import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 板块三·住（民宿预订）
 *
 * 后端目录归属：m3-stay
 * 表前缀：sty_
 * 错误码号段：50000–59999
 */
export default () => {
  return {
    name: '板块三·住（民宿预订）',
    description: '板块三·住（民宿预订）（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
