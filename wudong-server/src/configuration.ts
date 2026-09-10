import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as typeorm from '@midwayjs/typeorm';
import * as validate from '@midwayjs/validate';
import { join } from 'path';

@Configuration({
  imports: [koa, typeorm, validate],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  async onReady() {
    // 禁用集群模式，避免端口被占用
  }
}