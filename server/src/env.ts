/**
 * 环境变量加载（必须在任何 config / 服务读取 process.env 之前执行）
 *
 * 背景：本项目的 Midway 版本是 3.20，**并不自带 .env 加载**（@midwayjs 依赖树里
 * 没有任何 dotenv 引用）。这导致 server/.env 长期形同虚设 ——
 * 所有配置实际走的都是 config.default.ts 里的兜底默认值，
 * 与 .env 里写的值「碰巧一致」所以一直没被发现。
 *
 * 症状：往 .env 里加 DEEPSEEK_API_KEY 后，重启后端依然读到 undefined。
 *
 * 修法：显式加载。此模块被 configuration.ts 第一个 import，
 * 而 configuration.ts 是 Midway 的入口配置，因此早于全部 config 求值；
 * 生产模式的 bootstrap.js 走 Bootstrap.run() 也会先加载 configuration.ts，同样覆盖。
 *
 * 注意：dotenv 默认不覆盖已存在的 process.env（真机环境变量优先），
 * 这正是我们需要的行为 —— 服务器上可以用真实环境变量压过 .env。
 */
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

// cwd 是 server/（npm run dev 与 start-dev.bat 都在该目录下启动）
const candidates = [
  join(process.cwd(), '.env'),
  join(__dirname, '../.env'),
  join(__dirname, '../../.env'),
];

const hit = candidates.find(p => existsSync(p));
if (hit) {
  loadEnv({ path: hit });
}
