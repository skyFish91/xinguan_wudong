import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: 'wudong_secret_key_20260909',
  koa: {
    port: parseInt(process.env.PORT || '7001'),
    hostname: '127.0.0.1',  // 只监听 IPv4 localhost，避免 IPv6 冲突
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3307'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '15715659594',
        database: process.env.DB_NAME || 'wudong',
        synchronize: false,
        logging: process.env.NODE_ENV === 'local',
        entities: ['**/entity/*.entity{.ts,.js}'],
        charset: 'utf8mb4',
      },
    },
  },
} as MidwayConfig;
