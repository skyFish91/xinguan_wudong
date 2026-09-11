/**
 * 前后端接口差集扫描
 * 用法: node scripts/route-diff.mjs [前端目录...]
 * 说明:
 *  - 扫描前端 request.get/post/put/delete(`路径`) 调用
 *  - 扫描后端 @Controller('/api/xxx') + @Get/@Post/@Put/@Delete('子路径')
 *  - 输出：前端调用中「后端无匹配路由」的清单
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.cwd());
const frontDirs = process.argv.slice(3);
const serverSrc = path.join(root, 'server', 'src');

function walk(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some(x => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

// ---- 1. 收集后端路由 ----
const httpMethods = ['Get', 'Post', 'Put', 'Delete', 'Patch'];
const backendRoutes = []; // { method, full, file, line }
for (const file of walk(serverSrc, ['.ts'])) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let prefix = null;
  lines.forEach((line, i) => {
    const ctrl = line.match(/@Controller\(\s*['"`]([^'"`]+)['"`]/);
    if (ctrl) { prefix = ctrl[1]; return; }
    for (const m of httpMethods) {
      const r = line.match(new RegExp(`@${m}\\(\\s*['"\`]([^'"\`]*)['"\`]`));
      if (r && prefix) {
        const sub = r[1];
        const full = (prefix.replace(/\/$/, '') + (sub.startsWith('/') ? sub : '/' + sub)).replace(/\/{2,}/g, '/');
        backendRoutes.push({ method: m.toUpperCase(), full, file: path.relative(root, file), line: i + 1 });
      }
    }
  });
}

// ---- 2. 收集前端调用 ----
const frontCalls = []; // { method, p, file, line }
for (const dir of frontDirs) {
  const base = path.join(root, dir);
  for (const file of walk(base, ['.vue', '.ts', '.js'])) {
    if (file.includes(`${path.sep}api${path.sep}request.`)) continue;
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      const re = /request\.(get|post|put|delete)\(\s*[`'"]([^`'"]+)/g;
      let m;
      while ((m = re.exec(line))) {
        frontCalls.push({ method: m[1].toUpperCase(), p: m[2], file: path.relative(root, file), line: i + 1 });
      }
    });
  }
}

// ---- 3. 归一化 & 差集 ----
const normSeg = s => s.replace(/\$\{[^}]+\}/g, ':p').replace(/:[A-Za-z_][\w]*/g, ':p').replace(/\/+$/, '') || '/';
// 注意：不能简单剥离 /api 前缀，否则 /api/ai/chat 与 /ai/chat 会被误判成同一条，
// 而这个差异正是「前端代理得到、但后端路由不对」的典型 bug。
// 正确做法：前端相对路径按 axios 的 baseURL 补回前缀，再做精确比对。
const API_BASE = process.env.ROUTE_DIFF_BASE || '/api';
const normPath = (p, isFront) => {
  let x = String(p).trim();
  if (isFront && !x.startsWith(API_BASE + '/') && x !== API_BASE) {
    x = API_BASE + (x.startsWith('/') ? x : '/' + x);
  }
  if (!x.startsWith('/')) x = '/' + x;
  return normSeg(x);
};

const backendPatterns = backendRoutes.map(r => ({
  method: r.method,
  segs: normPath(r.full, false).split('/').filter(Boolean),
}));

function match(method, p) {
  const segs = normPath(p, true).split('/').filter(Boolean);
  return backendPatterns.some(bp => {
    if (bp.method !== method) return false;
    if (bp.segs.length !== segs.length) return false;
    return bp.segs.every((s, i) => s === ':p' ? true : s === segs[i]);
  });
}

const missing = [];
const seen = new Set();
for (const c of frontCalls) {
  const key = `${c.method} ${c.p}`;
  if (seen.has(key)) continue;
  seen.add(key);
  if (!match(c.method, c.p)) missing.push(c);
}

console.log(`后端路由: ${backendRoutes.length} 条`);
console.log(`前端调用(去重): ${seen.size} 条`);
console.log('---');
if (missing.length === 0) {
  console.log('OK: 未发现缺失路由');
} else {
  console.log(`缺失 ${missing.length} 条:`);
  for (const m of missing) console.log(`  ✗ ${m.method} ${m.p}   <-- ${m.file}:${m.line}`);
}
