import { ModuleConfig } from '@cool-midway/core';

/**
 * 社区模块（照片分享）
 */
export default () => {
  return {
    name: '社区模块',
    description: '游记/照片/短视频 UGC 社区（设计文档 §26）',
    middlewares: [],
    globalMiddlewares: [],
    order: 15,
  } as ModuleConfig;
};
