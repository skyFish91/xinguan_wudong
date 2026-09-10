/**
 * 日期归一化工具。
 *
 * 背景：MySQL 的 `date` 列在配合 `timezone: '+08:00'` 时，mysql2 会把它解析成
 * `new Date('YYYY-MM-DDT00:00:00+08:00')` 这样的 UTC 时刻；TypeORM 再用运行机器的
 * 本地时区重新格式化，导致在 UTC 机器（CI）上出现「日期偏移一天」的问题。
 * 因此统一在服务层把日期归一化为不带时区的 'YYYY-MM-DD' 字符串。
 */

/** 将任意日期值归一化为 'YYYY-MM-DD' 字符串；无法解析时返回 null。 */
export function normalizeDateToYMD(v: unknown): string | null {
  if (v == null) return null;

  // Date 对象：用本地时区取年月日（与 dayjs().format('YYYY-MM-DD') 语义一致）
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const s = String(v).trim();
  if (!s) return null;

  // 形如 'YYYY-MM-DD' 或带时间/时区后缀（'YYYY-MM-DDTHH:mm:ss...'、'YYYY-MM-DD HH:mm:ss'）
  // 统一取前 10 位；无法匹配时原样返回。
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : s;
}
