import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import { TenantSubscriber } from '../modules/base/db/tenant';
import { SnakeNamingStrategy } from '../common/naming-strategy';

/**
 * 本地开发 npm run dev 读取的配置文件
 */
export default {
  bodyParser: {
    formLimit: '50mb',
    jsonLimit: '50mb',
    textLimit: '50mb',
    limit: '50mb',
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3307,
        username: 'root',
        password: 'Hhl123456',
        database: 'wudong',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        logging: false,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        cache: true,
        entities: ['**/modules/*/entity'],
        subscribers: [TenantSubscriber],
      },
    },
  },
  cool: {
    eps: true,
    initDB: true,
    initJudge: 'db',
    initMenu: true,
  } as CoolConfig,
} as MidwayConfig;
