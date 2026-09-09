import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 公共层
 *
 * 后端目录归属：common
 * 表前缀：usr_ mch_ ord_ sys_ cms_
 * 错误码号段：10000–19999 / 90000–99999
 */
export default () => {
  return {
    name: '公共层',
    description: '公共层（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 20,
  } as ModuleConfig;
};
