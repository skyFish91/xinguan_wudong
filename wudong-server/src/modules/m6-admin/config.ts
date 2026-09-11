import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 板块六·平台管理后台
 *
 * 后端目录归属：m6-admin
 * 表前缀：sys_ mch_ fin_
 * 错误码号段：80000–89999
 */
export default () => {
  return {
    name: '板块六·平台管理后台',
    description: '板块六·平台管理后台（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
