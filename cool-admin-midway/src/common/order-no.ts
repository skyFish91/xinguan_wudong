/**
 * 订单号生成：yyyyMMddHHmmss + 6 位随机。
 * 幂等以 clientRequestId 为准（Task 4），order_no 仅做展示与追溯。
 */
export function genOrderNo(prefix = 'WD'): string {
  const now = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  const ts =
    `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}` +
    `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  const rand = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `${prefix}${ts}${rand}`;
}
