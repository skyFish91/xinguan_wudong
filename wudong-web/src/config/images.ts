// 景区图片映射表 - 根据景区名称关键词匹配
export const scenicImageMap: Record<string, string> = {
  '千户苗寨': '/images/scenic/千户苗寨.jpg',
  '荔波': '/images/scenic/荔波七小孔.jpg',
  '镇远': '/images/scenic/镇远古镇.jpg',
  '梵净山': '/images/scenic/梵净山.jpg',
  '黄果树': '/images/scenic/黄果树瀑布.jpg',
  '织金洞': '/images/scenic/织金洞.jpg',
  '青岩': '/images/scenic/青岩古镇.jpg',
  '龙宫': '/images/scenic/龙宫风景区.jpg',
  '百里杜鹃': '/images/scenic/百里杜鹃.jpg',
  '万峰林': '/images/scenic/万峰林.jpg',
  '黔灵山': '/images/scenic/黔灵山公园.jpg',
  '赤水': '/images/scenic/赤水丹霞.jpg',
  '马岭河': '/images/scenic/马岭河峡谷.jpg',
  '天河潭': '/images/scenic/天河潭.jpg',
  '肇兴': '/images/scenic/肇兴侗寨.jpg',
}

// 景区默认图片配置 - 按照数据库顺序
// ID:1 西江千户苗寨, ID:2 荔波小七孔, ID:4 梵净山, ID:6 黄果树瀑布, ID:8 镇远古镇
// ID:10 织金洞, ID:11 青岩古镇, ID:12 龙宫风景区, ID:13 百里杜鹃, ID:14 万峰林
// ID:15 黔灵山公园, ID:16 赤水丹霞, ID:17 马岭河峡谷, ID:18 天河潭, ID:19 肇兴侗寨
export const scenicImages = [
  '/images/scenic/千户苗寨.jpg',        // 索引0 - ID:1 西江千户苗寨
  '/images/scenic/荔波七小孔.jpg',      // 索引1 - ID:2 荔波小七孔
  '/images/scenic/梵净山.jpg',          // 索引2 - ID:4 梵净山
  '/images/scenic/黄果树瀑布.jpg',      // 索引3 - ID:6 黄果树瀑布
  '/images/scenic/镇远古镇.jpg',        // 索引4 - ID:8 镇远古镇
  '/images/scenic/织金洞.jpg',          // 索引5 - ID:10 织金洞
  '/images/scenic/青岩古镇.jpg',        // 索引6 - ID:11 青岩古镇
  '/images/scenic/龙宫风景区.jpg',      // 索引7 - ID:12 龙宫风景区
  '/images/scenic/百里杜鹃.jpg',        // 索引8 - ID:13 百里杜鹃
  '/images/scenic/万峰林.jpg',          // 索引9 - ID:14 万峰林
  '/images/scenic/黔灵山公园.jpg',      // 索引10 - ID:15 黔灵山公园
  '/images/scenic/赤水丹霞.jpg',        // 索引11 - ID:16 赤水丹霞
  '/images/scenic/马岭河峡谷.jpg',      // 索引12 - ID:17 马岭河峡谷
  '/images/scenic/天河潭.jpg',          // 索引13 - ID:18 天河潭
  '/images/scenic/肇兴侗寨.jpg',        // 索引14 - ID:19 肇兴侗寨
]

// 路线图片映射表 - 根据路线名称关键词匹配
export const routeImageMap: Record<string, string> = {
  '苗岭徒步': '/images/route/苗岭徒步一日游.jpg',
  '乌东非遗': '/images/route/乌东非遗两日游.jpg',
  '亲子研学': '/images/route/亲子研学营.jpg',
  '黔东南民族': '/images/route/黔东南民族风情3日游.jpg',
  '贵州经典环线': '/images/route/贵州经典环线5日游.jpg',
  '苗寨侗寨': '/images/route/苗寨侗寨深度4日游.jpg',
  // 没有专属路线图片的，使用对应景区图片
  '黄果树': '/images/scenic/黄果树瀑布.jpg',
  '梵净山': '/images/scenic/梵净山.jpg',
  '荔波': '/images/scenic/荔波七小孔.jpg',
  '镇远': '/images/scenic/镇远古镇.jpg',
  '贵州全景': '/images/scenic/千户苗寨.jpg',
}

// 路线默认图片配置
export const routeImages = [
  '/images/route/苗岭徒步一日游.jpg',
  '/images/route/乌东非遗两日游.jpg',
  '/images/route/亲子研学营.jpg',
  '/images/route/黔东南民族风情3日游.jpg',
  '/images/route/贵州经典环线5日游.jpg',
  '/images/route/苗寨侗寨深度4日游.jpg',
]

// 页面背景图片配置
export const backgroundImages = {
  // 首页背景
  home: '/images/background/首页背景图.jpg',
  // 景区列表页背景
  scenic: '/images/background/景区背景图.jpg',
  // 路线列表页背景
  route: '/images/background/路线背景图.jpg',
  // 天气背景
  weather: '/images/background/天气背景图.jpg',
}
