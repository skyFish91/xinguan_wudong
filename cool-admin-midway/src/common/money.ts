/**
 * 金额工具：全平台金额统一用「分」(整数)存储与传输。
 * 设计文档 §14：禁止 DECIMAL/FLOAT；§8.1：金额字段存分。
 */
export function yuanToFen(yuan: number | string): number {
  const n = typeof yuan === 'string' ? parseFloat(yuan) : yuan;
  if (Number.isNaN(n)) {
    throw new Error('金额格式错误');
  }
  return Math.round(n * 100);
}

export function fenToYuan(fen: number): number {
  return Math.round(fen) / 100;
}
