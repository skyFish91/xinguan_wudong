import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置 —— 板块五·社区（照片分享）
 *
 * 后端目录归属：m5-community
 * 表前缀：note_
 * 错误码号段：70000–79999
 */
export default () => {
  return {
    name: '板块五·社区（照片分享）',
    description: '板块五·社区（照片分享）（乌东文旅平台）',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
