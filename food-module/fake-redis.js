// 极简 Redis 兼容服务器（内存实现），用于本地开发环境无 Redis 时让后端正常启动。
// 支持 RESP 协议与 ioredis 连接握手所需的基础命令。
const net = require('net');

const store = new Map(); // key -> { value: string, expireAt: number|null }

function now() { return Date.now(); }

function encodeSimple(s) { return '+' + s + '\r\n'; }
function encodeError(s) { return '-' + s + '\r\n'; }
function encodeInt(n) { return ':' + n + '\r\n'; }
function encodeBulk(s) {
  if (s === null || s === undefined) return '$-1\r\n';
  const str = String(s);
  const buf = Buffer.from(str, 'utf8');
  return '$' + buf.length + '\r\n' + str + '\r\n';
}
function encodeBulkBuffer(buf) {
  return '$' + buf.length + '\r\n';
}

function buildInfo() {
  const lines = [
    '# Server',
    'redis_version:7.0.0',
    'redis_mode:standalone',
    'os:windows',
    '# Replication',
    'role:master',
    'connected_slaves:0',
    'master_failover_state:no-failover',
    'master_replid:0000000000000000000000000000000000000000',
    'master_repl_offset:0',
    '# Keyspace',
  ];
  return lines.join('\r\n');
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expireAt !== null && entry.expireAt <= now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, opts) {
  let expireAt = null;
  for (let i = 0; i < opts.length; i++) {
    const o = String(opts[i] || '').toUpperCase();
    if (o === 'EX') expireAt = now() + Number(opts[i + 1]) * 1000;
    else if (o === 'PX') expireAt = now() + Number(opts[i + 1]);
    else if (o === 'EXAT') expireAt = Number(opts[i + 1]) * 1000;
    else if (o === 'PXAT') expireAt = Number(opts[i + 1]);
    else if (o === 'NX' || o === 'XX') { /* 忽略 */ }
    else if (o === 'KEEPTTL') { /* 忽略 */ }
  }
  store.set(key, { value: String(value), expireAt });
  return 'OK';
}

function handleCommand(args) {
  if (!args || args.length === 0) return encodeError('ERR empty command');
  const cmd = String(args[0]).toUpperCase();
  switch (cmd) {
    case 'PING':
      return args[1] ? encodeBulk(args[1]) : encodeSimple('PONG');
    case 'ECHO':
      return encodeBulk(args[1]);
    case 'INFO': {
      const body = buildInfo();
      return '$' + Buffer.byteLength(body) + '\r\n' + body + '\r\n';
    }
    case 'SELECT':
    case 'CLIENT':
    case 'HELLO':
      return encodeSimple('OK');
    case 'COMMAND':
      // ioredis 连接后可能发送 COMMAND 探测；返回空数组即可
      return '*0\r\n';
    case 'GET':
      return encodeBulk(get(args[1]));
    case 'MGET': {
      const vals = args.slice(1).map(k => encodeBulk(get(k)));
      return '*' + vals.length + '\r\n' + vals.join('');
    }
    case 'SET':
      return encodeSimple(set(args[1], args[2], args.slice(3)));
    case 'SETNX':
      if (store.has(args[1])) return encodeInt(0);
      store.set(args[1], { value: String(args[2]), expireAt: null });
      return encodeInt(1);
    case 'DEL': {
      let n = 0;
      for (let i = 1; i < args.length; i++) if (store.delete(args[i])) n++;
      return encodeInt(n);
    }
    case 'UNLINK': {
      let n = 0;
      for (let i = 1; i < args.length; i++) if (store.delete(args[i])) n++;
      return encodeInt(n);
    }
    case 'EXISTS':
      return encodeInt(get(args[1]) !== null ? 1 : 0);
    case 'EXPIRE': {
      const e = store.get(args[1]);
      if (!e) return encodeInt(0);
      e.expireAt = now() + Number(args[2]) * 1000;
      return encodeInt(1);
    }
    case 'PEXPIRE': {
      const e = store.get(args[1]);
      if (!e) return encodeInt(0);
      e.expireAt = now() + Number(args[2]);
      return encodeInt(1);
    }
    case 'TTL': {
      const e = store.get(args[1]);
      if (!e) return encodeInt(-2);
      if (e.expireAt === null) return encodeInt(-1);
      const t = Math.max(0, Math.floor((e.expireAt - now()) / 1000));
      return encodeInt(t);
    }
    case 'INCR':
    case 'DECR': {
      const cur = Number(get(args[1]) || 0);
      const next = cur + (cmd === 'INCR' ? 1 : -1);
      store.set(args[1], { value: String(next), expireAt: null });
      return encodeInt(next);
    }
    case 'INCRBY':
    case 'DECRBY': {
      const cur = Number(get(args[1]) || 0);
      const next = cur + (cmd === 'INCRBY' ? Number(args[2]) : -Number(args[2]));
      store.set(args[1], { value: String(next), expireAt: null });
      return encodeInt(next);
    }
    case 'KEYS':
      return encodeArray(Array.from(store.keys()));
    case 'SCAN':
      return encodeArray([]);
    case 'FLUSHDB':
    case 'FLUSHALL':
      store.clear();
      return encodeSimple('OK');
    case 'DBSIZE':
      return encodeInt(store.size);
    case 'TYPE':
      return encodeSimple('string');
    case 'RANDOMKEY':
      return encodeBulk(store.keys().next().value || null);
    case 'HSET':
    case 'HMSET': {
      // 简单 hash 存储
      const hk = args[1];
      let h = store.get(hk);
      let obj = h ? JSON.parse(h || '{}') : {};
      for (let i = 2; i + 1 < args.length; i += 2) obj[args[i]] = String(args[i + 1]);
      store.set(hk, { value: JSON.stringify(obj), expireAt: null });
      return encodeInt(1);
    }
    case 'HGET': {
      const h = store.get(args[1]);
      if (h === null) return encodeBulk(null);
      const obj = JSON.parse(h || '{}');
      return encodeBulk(obj[args[2]] !== undefined ? obj[args[2]] : null);
    }
    case 'HGETALL': {
      const h = store.get(args[1]);
      if (h === null) return encodeArray(null);
      const obj = JSON.parse(h || '{}');
      const flat = [];
      for (const k in obj) flat.push(k, obj[k]);
      return encodeArray(flat);
    }
    case 'HDEL': {
      const h = store.get(args[1]);
      if (h === null) return encodeInt(0);
      const obj = JSON.parse(h || '{}');
      let n = 0;
      for (let i = 2; i < args.length; i++) if (delete obj[args[i]]) n++;
      store.set(args[1], { value: JSON.stringify(obj), expireAt: null });
      return encodeInt(n);
    }
    case 'CONFIG':
      return encodeArray([]);
    case 'QUIT':
      return encodeSimple('OK');
    default:
      // 未知命令：返回简单 OK 避免 ioredis 报错（用于 LIST/LLEN/RPUSH 等不常用命令）
      return encodeSimple('OK');
  }
}

const server = net.createServer((socket) => {
  let buf = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    // 解析 RESP 数组：*<n>\r\n 后跟 n 个 $<len>\r\n<data>\r\n
    while (true) {
      if (buf.length === 0) break;
      if (buf[0] !== 0x2a) { // '*'
        // 非法，丢弃
        buf = Buffer.alloc(0);
        break;
      }
      let pos = buf.indexOf('\r\n');
      if (pos < 0) break;
      const argc = parseInt(buf.toString('utf8', 1, pos), 10);
      if (isNaN(argc)) { buf = Buffer.alloc(0); break; }
      let offset = pos + 2;
      const args = [];
      let ok = true;
      for (let i = 0; i < argc; i++) {
        if (buf[offset] !== 0x24) { ok = false; break; } // '$'
        const p2 = buf.indexOf('\r\n', offset);
        if (p2 < 0) { ok = false; break; }
        const len = parseInt(buf.toString('utf8', offset + 1, p2), 10);
        if (isNaN(len)) { ok = false; break; }
        const start = p2 + 2;
        const end = start + len;
        if (buf.length < end + 2) { ok = false; break; }
        args.push(buf.toString('utf8', start, end));
        offset = end + 2;
      }
      if (!ok) break; // 数据不完整，等更多
      buf = buf.slice(offset);
      try {
        socket.write(handleCommand(args));
      } catch (e) {
        socket.write(encodeError('ERR ' + e.message));
      }
    }
  });
  socket.on('error', () => {});
});

const PORT = 6379;
server.listen(PORT, '127.0.0.1', () => {
  console.log('[fake-redis] listening on 127.0.0.1:' + PORT);
});
