import * as orm from '@midwayjs/typeorm';
import {
  Configuration,
  App,
  IMidwayApplication,
  Inject,
  ILogger,
  MidwayWebRouterService,
  MidwayDecoratorService,
} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
// import * as crossDomain from '@midwayjs/cross-domain';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as staticFile from '@midwayjs/static-file';
import * as cron from '@midwayjs/cron';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import * as ProdConfig from './config/config.prod';
import * as cool from '@cool-midway/core';
import * as upload from '@midwayjs/upload';
// import * as task from '@cool-midway/task';
// import * as rpc from '@cool-midway/rpc';

// import { ResponseMiddleware } from './common/middleware/response.middleware';
// import { registerCurrentUserHandlers } from './common/decorator/current-user';

@Configuration({
  imports: [
    // https://koajs.com/
    koa,
    // 是否开启跨域(注：顺序不能乱放！！！) http://www.midwayjs.org/docs/extensions/cross_domain
    // crossDomain,
    // 静态文件托管 https://midwayjs.org/docs/extensions/static_file
    staticFile,
    // orm https://midwayjs.org/docs/extensions/orm
    orm,
    // 参数验证 https://midwayjs.org/docs/extensions/validate
    validate,
    // 本地任务 http://www.midwayjs.org/docs/extensions/cron
    cron,
    // 文件上传
    upload,
    // cool-admin 官方组件 https://cool-js.com
    cool,
    // rpc 微服务 远程调用
    // rpc,
    // 任务与队列
    // task,
    {
      component: info,
      enabledEnvironment: ['local', 'prod'],
    },
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      prod: ProdConfig,
    },
  ],
})
export class MainConfiguration {
  @App()
  app: IMidwayApplication;

  @Inject()
  webRouterService: MidwayWebRouterService;

  @Inject()
  logger: ILogger;

  @Inject()
  decoratorService: MidwayDecoratorService;

  async onReady() {
    // 注册 @CurrentUser / @CurrentUserId 参数解析器
    // registerCurrentUserHandlers((key, fn) =>
    //   this.decoratorService.registerParameterHandler(key, fn)
    // );

    // 统一响应包装：把 Controller 的直接返回包成 { code:0, message:'ok', data }
    // 并把 Cool 内置模块的 code:1000 归一化为 0（设计文档 §5.1）
    // this.app.useMiddleware([ResponseMiddleware]);
  }
}
