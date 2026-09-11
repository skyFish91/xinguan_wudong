/**
 * 旅行页面的本地兜底图片映射。
 * 后端返回主图时优先使用后端数据；这里仅用于缺图场景。
 */
export const scenicImageMap: Record<string, string> = {
  '西江': '/uploads/seeds/scenic-xijiang.jpg',
  '荔波': '/uploads/seeds/scenic-liboqixiaokong.jpg',
  '镇远': '/uploads/seeds/scenic-zhenyuan.jpg',
};

export const routeImageMap: Record<string, string> = {
  '苗寨': '/uploads/seeds/scenic-xijiang.jpg',
  '荔波': '/uploads/seeds/scenic-liboqixiaokong.jpg',
  '镇远': '/uploads/seeds/scenic-zhenyuan.jpg',
};
