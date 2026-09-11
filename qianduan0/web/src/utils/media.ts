/**
 * 图片解析工具
 *
 * 背景：种子数据里的图片都是 `/uploads/seeds/*.svg`——纯色块 + 文字的占位图，
 * 这是页面「塑料感」的根源。本模块把占位图与空图统一映射到 public/images/ 下的
 * 真实照片，前端一次性解决，不改数据库。
 *
 * 解析优先级：
 *   1. 真实图片（http(s)、/images/、/uploads/2xxxxxxx 上传目录）原样返回
 *   2. preferTitle 时优先按标题关键词匹配（社区帖子/话题/攻略，标题比文件名更权威）
 *   3. 按 seed 文件名精确映射
 *   4. 按标题关键词匹配
 *   5. 按 key 稳定哈希取一张（保证同一实体每次渲染图片不变）
 */

const POOL = '/images';

/* ==========================================================================
   清晰度分级（重要约定，改图前先读）
   --------------------------------------------------------------------------
   本目录素材分辨率差异很大（703px ~ 9500px）。显示效果只取决于
   「素材长边 ÷ 实际显示宽度 ÷ 设备像素比」。

   实测结论（按 2x 屏估算）：
     · 大区域（首页轮播 1192px 宽、详情页主图 ~680px、登录页左屏 ~660px）
       需要 ≥ 2048px，否则肉眼可见发虚 —— 这是 LARGE 集的入集门槛
     · 卡片缩略图（≤ 400px 宽）只需 ≥ 800px，1072px 的图完全够用
       —— 所以低清图不是不能用，只是「不能放大区域」

   于是分两档：
     LARGE   长边 ≥ 2048，可用于轮播 / 大图 / 全宽区块
     SMALL   长边 <  2048，只用于缩略图、小图标位

   `imgLarge()` 会把候选图池过滤到 LARGE 档，供大区域调用；
   `img()` 不设限，用于卡片缩略图。
   ========================================================================== */
const LARGE_SET = new Set<string>([
  // 4K 及以上（长边 ≥ 2048）
  'architecture.jpg',
  'banquet-2.jpg',
  'batik-2.jpg',
  'batik-knife.jpg',
  'batik.jpg',
  'bonfire.jpg',
  'bridge.jpg',
  'clouds.jpg',
  'costume-1.jpg',
  'costume-2.jpg',
  'costume-3.jpg',
  'costume-4.jpg',
  'embroidery.jpg',
  'fireside.jpg',
  'hero-clouds.jpg',
  'indigo.jpg',
  'instrument.jpg',
  'lodge-dining.jpg',
  'lusheng-craft.jpg',
  'lusheng.jpg',
  'rice-wine-1.jpg',
  'rice-wine-2.jpg',
  'silver-2.jpg',
  'silver-craft.jpg',
  'silver.jpg',
  'sunrise-2.jpg',
  'sunrise.jpg',
  'terraces-2.jpg',
  'terraces.jpg',
  'welcome-wine.jpg',
  'windrain-bridge.jpg',
  'wine-craft.jpg',
  'wine-dining.jpg',
]);

/** 该文件是否够清晰、可用于大区域 */
export function isLarge(file: string): boolean {
  const name = file.split('/').pop() || '';
  return LARGE_SET.has(name);
}

/** 大区域专用候选池：只保留 LARGE 档 */
export const LARGE_POOL: string[] = [
  'hero-clouds.jpg',
  'terraces-2.jpg',
  'clouds.jpg',
  'bonfire.jpg',
  'embroidery.jpg',
  'silver.jpg',
  'batik.jpg',
  'costume-3.jpg',
  'windrain-bridge.jpg',
  'lusheng.jpg',
  'indigo.jpg',
  'wine-dining.jpg',
];

/** seed 文件名（不含扩展名）→ 照片 */
const SEED_MAP: Record<string, string> = {
  // 轮播 / 活动 —— 这几个位置是首屏大图，**必须**是 LARGE 档
  'banner-1': 'hero-clouds.jpg', // 4K 云海全景
  'banner-2': 'silver.jpg', // 原 silver-forge 仅 1080px，首屏发虚
  'banner-3': 'banquet-2.jpg', // 原 longtable-2 仅 1080px
  'banner-4': 'bonfire.jpg', // 原 festival 仅 1078px
  'activity-1': 'bonfire.jpg',
  'activity-2': 'wine-dining.jpg',

  // 衣 · 非遗商品
  'product-silver-1': 'silver.jpg',
  'product-silver-2': 'silver-2.jpg',
  'product-batik-1': 'batik.jpg',
  'product-batik-2': 'batik-2.jpg',
  'product-embroidery-1': 'embroidery.jpg',
  'product-costume-1': 'costume-1.jpg',

  // 食 · 餐厅与农产
  'restaurant-1': 'banquet-2.jpg', // 原 longtable.png 仅 703px
  'restaurant-2': 'wine-dining.jpg',
  'farm-tea': 'tea.jpg',
  'farm-wine': 'rice-wine-1.jpg',
  'farm-bacon': 'banquet-2.jpg',
  'farm-sour': 'sourfish.png',

  // 住
  'homestay-1': 'architecture.jpg', // 原 diaojiaolou 仅 1078px，详情页主图发虚
  'homestay-2': 'lodge-dining.jpg',
  'room-1': 'lodge-dining.jpg',
  'room-2': 'fireside.jpg',
  'room-3': 'indigo.jpg',
  'room-4': 'windrain-bridge.jpg',
  'room-5': 'sunrise.jpg',
  'room-6': 'bonfire.jpg',

  // 行
  'scenic-1': 'terraces-2.jpg', // 原 terraces-3 仅 1073px
  'scenic-2': 'clouds.jpg',
  'route-1': 'silver-craft.jpg', // 原 silver-forge 仅 1080px
  'route-2': 'terraces.jpg',
  'route-3': 'clouds.jpg',
  'guide-1': 'bridge.jpg', // 原 topic-guide 仅 1078px
  'guide-2': 'photography.jpg',
  'guide-3': 'medicine.jpg',

  // 分类小图
  'cat-silver': 'silver.jpg',
  'cat-batik': 'batik.jpg',
  'cat-costume': 'costume-2.jpg',
  'cat-embroidery': 'embroidery.jpg',
  'cat-tea': 'tea.jpg',
  'cat-wine': 'rice-wine-2.jpg',
  'cat-sour': 'sourfish-2.jpg',
  'cat-bacon': 'banquet-2.jpg',
  'cat-other': 'handicraft.jpg',

  // 菜品
  'dish-1': 'fish.jpg',
  'dish-2': 'sourfish-2.jpg',
  'dish-3': 'sourfish.png',
  'dish-4': 'rice-colorful.png',
  'dish-5': 'banquet.jpg',
  'dish-6': 'rice.jpg',
};

/**
 * 标题关键词 → 候选照片池。
 *
 * 用「池」而不是单张，是因为同一关键词会命中多条数据（如两家民宿都叫"吊脚楼/木楼"、
 * 三篇攻略都是"……出发"），单张会让列表里出现一模一样的图，一眼就露馅。
 * 命中后用 salt 的稳定哈希在池内取一张：同一实体每次渲染固定，不同实体错开。
 *
 * 顺序即优先级：专有名词在前，泛化词在后。特别注意「餐饮」必须排在「梯田」之前，
 * 否则"梯田味道农家菜"会被梯田风光抢走。
 */
const KEYWORD_MAP: Array<[RegExp, string[]]> = [
  // —— 专有名词 ——
  // 池内一律「高清在前、低清在后」。大区域调用会经 imgLarge() 过滤掉低清项，
  // 卡片缩略图则保留低清项以增加多样性（见文件顶部清晰度分级说明）。
  [/长桌宴/, ['banquet-2.jpg', 'wine-dining.jpg', 'longtable-2.jpg']],
  [/酸汤/, ['sourfish-2.jpg', 'sourfish.png']],
  [/银饰|银器|錾花|锻制|锻造|苗银|项圈|手镯/, ['silver.jpg', 'silver-2.jpg', 'silver-craft.jpg', 'batik-knife.jpg']],
  [/蜡染|靛蓝|蓝染|蜡刀|布艺/, ['batik.jpg', 'batik-2.jpg', 'indigo.jpg']],
  [/苗绣|刺绣|数纱绣|绣/, ['embroidery.jpg', 'batik-knife.jpg', 'batik-embroidery.jpg']],
  [/芦笙|飞歌|歌舞|乐器/, ['lusheng-craft.jpg', 'lusheng.jpg', 'instrument.jpg', 'lusheng-dance.jpg']],
  [/篝火|夜市|夜晚/, ['bonfire.jpg', 'fireside.jpg']],
  [/风雨桥|鼓楼|吊脚楼|木楼|建筑|村寨|寨门/, ['architecture.jpg', 'windrain-bridge.jpg', 'bridge.jpg', 'diaojiaolou.jpg']],
  [/苗年|鼓藏|节庆|庆典|仪式|祭/, ['costume-2.jpg', 'costume-4.jpg', 'bonfire.jpg', 'festival.jpg', 'ritual.jpg']],
  [/苗医|苗药|药材/, ['medicine.jpg', 'handicraft.jpg']],
  [/茶/, ['tea.jpg', 'rice-colorful.png']],
  [/米酒|酿酒|酒/, ['rice-wine-1.jpg', 'rice-wine-2.jpg', 'wine-craft.jpg', 'welcome-wine.jpg']],
  [/服饰|盛装|女装|上衣|苗服|蜡染衣裙/, ['costume-3.jpg', 'costume-2.jpg', 'costume-4.jpg', 'costume-1.jpg', 'costume-5.jpg']],
  [/摄影|旅拍|拍照/, ['photography.jpg', 'hero-clouds.jpg']],
  [/手作|手工艺|工艺品|纪念品|工坊/, ['batik-knife.jpg', 'silver-craft.jpg', 'handicraft.jpg']],
  [/攻略|路线|行程|避坑|指南|自驾|高铁|大巴|包车/, ['bridge.jpg', 'terraces-2.jpg', 'photography.jpg', 'topic-guide.jpg']],

  // —— 泛化：餐饮在自然景观之前 ——
  [/美食|菜|宴|餐|辣|鱼|肉|米|饭/, ['banquet-2.jpg', 'wine-dining.jpg', 'fish.jpg', 'banquet.jpg', 'rice.jpg']],
  [/梯田|田园|稻/, ['terraces-2.jpg', 'terraces.jpg', 'terraces-3.jpg']],
  [/云海|云雾|日出|日落|晨雾|风光|风景/, ['clouds.jpg', 'sunrise.jpg', 'sunrise-2.jpg', 'hero-clouds.jpg']],
  [/民宿|住宿|客栈|山居|小院|房间/, ['lodge-dining.jpg', 'architecture.jpg', 'indigo.jpg', 'fireside.jpg', 'diaojiaolou.jpg']],
];

/**
 * 兜底池：无任何线索时按 key 稳定取一张。
 * 只收 LARGE 档 —— 兜底图会被用到任何位置，包括首屏，
 * 这里若混入低清图就会在最显眼的地方翻车。
 */
const FALLBACK_POOL = [
  'hero-clouds.jpg',
  'terraces-2.jpg',
  'clouds.jpg',
  'batik.jpg',
  'batik-2.jpg',
  'silver.jpg',
  'banquet-2.jpg',
  'bonfire.jpg',
  'windrain-bridge.jpg',
  'costume-3.jpg',
  'embroidery.jpg',
  'indigo.jpg',
];

/** 稳定字符串哈希（同 key 永远得到同一张图，避免刷新跳变） */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function byKeyword(title?: string, salt?: string, largeOnly = false): string | undefined {
  if (!title) return undefined;
  for (const [re, pool] of KEYWORD_MAP) {
    if (re.test(title)) {
      const usable = largeOnly ? pool.filter(isLarge) : pool;
      // 该关键词没有高清图（如酸汤鱼、苗药）：大区域宁可放弃语义匹配，
      // 也不能把低清图拉大 —— 交给上层走 LARGE_POOL 兜底
      if (!usable.length) return undefined;
      if (usable.length === 1) return usable[0];
      return usable[hash(salt || title) % usable.length];
    }
  }
  return undefined;
}

function seedToPhoto(src: string, largeOnly = false): string | undefined {
  const base = src.split('/').pop() || '';
  const name = base.replace(/\.svg$/i, '');
  const hit = SEED_MAP[name];
  if (hit && largeOnly && !isLarge(hit)) return undefined;
  return hit;
}

/** 是否为「不可用的占位图 / 空图」 */
function isPlaceholder(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return true;
  const s = src.trim();
  if (!s) return true;
  if (s === '[]' || s === 'null' || s === 'undefined') return true;
  if (s.startsWith('blob:') || s.startsWith('data:')) return true;
  return false;
}

/**
 * 解析出可直接放进 <img :src> 的地址。
 * @param src        后端给的原始地址
 * @param title      标题（用于关键词匹配与稳定哈希）
 * @param preferTitle 标题是否优先于 seed 文件名（社区帖子/话题/攻略建议 true）
 * @param salt       额外扰动因子（同一条数据的多张图传下标，避免一张图重复出现）
 */
export function img(src?: string | null, title?: string, preferTitle = false, salt?: string | number): string {
  return resolve(src, title, preferTitle, salt, false);
}

/**
 * 大区域专用：与 img() 同规则，但结果保证长边 ≥ 2048px。
 *
 * 用在「显示宽度可能超过 ~800px」的位置：首页轮播、活动大图、
 * 详情页主图/封面、登录页左侧实景、瀑布流大图等。
 * 卡片缩略图请继续用 img()，不要用这个 —— 它会把低清图换掉，
 * 反而牺牲语义匹配度，而缩略图根本看不出差异。
 *
 *   大区域  <img :src="imgLarge(b.imageUrl, b.title, true)" />
 *   缩略图  <img :src="img(p.mainImage, p.title, true)" />
 */
export function imgLarge(
  src?: string | null,
  title?: string,
  preferTitle = false,
  salt?: string | number
): string {
  return resolve(src, title, preferTitle, salt, true);
}

function resolve(
  src: string | null | undefined,
  title: string | undefined,
  preferTitle: boolean,
  salt: string | number | undefined,
  largeOnly: boolean
): string {
  const s = typeof src === 'string' ? src.trim() : '';
  const key = salt === undefined ? title || s || 'wudong' : `${title || ''}#${salt}`;

  // 1. 真实图片直接放行（用户上传的原图不做清晰度拦截，拦了会显示不出内容）
  if (s) {
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith(`${POOL}/`)) return s;
    if (s.startsWith('/uploads/') && !s.includes('/seeds/')) return s;
  }

  // 2/3/4. 映射
  if (s) {
    if (preferTitle) {
      const kw = byKeyword(title, key, largeOnly);
      if (kw) return `${POOL}/${kw}`;
    }
    const mapped = seedToPhoto(s, largeOnly);
    if (mapped) return `${POOL}/${mapped}`;
  }
  const kw = byKeyword(title, key, largeOnly);
  if (kw) return `${POOL}/${kw}`;

  // 5. 稳定兜底（两条兜底池都只含高清图）
  const pool = largeOnly ? LARGE_POOL : FALLBACK_POOL;
  return `${POOL}/${pool[hash(key) % pool.length]}`;
}

/**
 * 帖子/话题 images 字段可能是 JSON 数组字符串、逗号串或单值。
 * 统一解析成真实图片数组。同一实体的多张图会错开（不会重复同一张）。
 */
export function imgList(raw: unknown, title?: string): string[] {
  return resolveList(raw, title, false);
}

/** 大区域版 imgList：详情页大图/相册用，保证每张都 ≥ 2048px */
export function imgListLarge(raw: unknown, title?: string): string[] {
  return resolveList(raw, title, true);
}

function resolveList(raw: unknown, title: string | undefined, largeOnly: boolean): string[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === 'string' && raw.trim()) {
    const t = raw.trim();
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t);
        arr = Array.isArray(parsed) ? parsed : [t];
      } catch {
        arr = t.split(',');
      }
    } else {
      arr = t.split(',');
    }
  }
  const pick = largeOnly ? imgLarge : img;
  const out = arr
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((x) => x && x !== '[]' && x !== 'null')
    .map((x, i) => pick(x, title, true, i));
  return out.length ? out : [pick(undefined, title)];
}

/**
 * <img @error> 兜底：换成稳定兜底图，且只换一次，避免死循环。
 * 用法：<img :src="img(p.mainImage, p.title)" @error="imgError" />
 */
export function imgError(e: Event): void {
  const el = e.target as HTMLImageElement | null;
  if (!el || el.dataset.fallbackDone === '1') return;
  el.dataset.fallbackDone = '1';
  const seed = el.alt || el.src || 'wudong';
  el.src = `${POOL}/${FALLBACK_POOL[hash(seed) % FALLBACK_POOL.length]}`;
}

/* --------------------------------------------------------------------------
   常量表：页面里直接引用某张具体照片时用
   --------------------------------------------------------------------------
   PHOTO        不保证清晰度 —— 只用于小图标位、62px 入口卡、纯色底等
   PHOTO_LARGE  保证长边 ≥ 2048 —— 用于轮播、大图、全宽区块、登录页左屏
   放错组是这类项目最常见的观感事故，新增引用前先想清楚显示宽度。
   -------------------------------------------------------------------------- */
export const PHOTO = {
  /** ⚠️ 以下为低清图，仅限小尺寸使用 */
  longtable: `${POOL}/longtable-2.jpg`, // 1080x707
  lodge: `${POOL}/diaojiaolou.jpg`, // 1078x1319
  tea: `${POOL}/tea.jpg`, // 1072x843
  sourfish: `${POOL}/sourfish-2.jpg`, // 1073x1751
  handcraft: `${POOL}/handicraft.jpg`, // 1076x843
  medicine: `${POOL}/medicine.jpg`, // 1077x1100
  photography: `${POOL}/photography.jpg`, // 1076x617
  guide: `${POOL}/topic-guide.jpg`, // 1078x928
} as const;

export const PHOTO_LARGE = {
  hero: `${POOL}/hero-clouds.jpg`, // 7814x4073
  terraces: `${POOL}/terraces-2.jpg`, // 5184x3456
  clouds: `${POOL}/clouds.jpg`, // 7814x4073
  silver: `${POOL}/silver.jpg`, // 6000x4000
  batik: `${POOL}/batik.jpg`, // 3360x2240
  costume: `${POOL}/costume-3.jpg`, // 4928x3280
  embroidery: `${POOL}/embroidery.jpg`, // 6240x4160
  feast: `${POOL}/banquet-2.jpg`, // 3000x2000
  lodge: `${POOL}/architecture.jpg`, // 2685x4025
  bridge: `${POOL}/windrain-bridge.jpg`, // 3840x2160
  sunrise: `${POOL}/sunrise.jpg`, // 5760x8640
  bonfire: `${POOL}/bonfire.jpg`, // 5624x3749
  indigo: `${POOL}/indigo.jpg`, // 6240x4160
  riceWine: `${POOL}/rice-wine-1.jpg`, // 6720x4480
  lusheng: `${POOL}/lusheng.jpg`, // 5624x3749
} as const;

/**
 * 首页轮播：4 张必须全部 ≥ 2048px。
 * 历史上这里混入过 1080px 的图，首屏 1192px 宽 + 2x 屏 = 需要 2384px，
 * 放大后肉眼可见发虚，是「塑料感」的来源之一。
 */
export const HERO_SLIDES = [
  PHOTO_LARGE.hero, // 苗寨云海全景
  PHOTO_LARGE.terraces, // 梯田
  PHOTO_LARGE.feast, // 长桌宴
  PHOTO_LARGE.silver, // 银饰工坊
] as const;

export default img;
