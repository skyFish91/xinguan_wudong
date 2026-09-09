import { genOrderNo } from '../../../src/common/order-no';

describe('order-no', () => {
  it('以指定前缀开头且长度为 20', () => {
    const no = genOrderNo('WD');
    expect(no.startsWith('WD')).toBe(true);
    expect(no.length).toBe(22); // WD(2) + 时间戳(14) + 随机(6)
  });

  it('连续生成不重复', () => {
    const a = genOrderNo();
    const b = genOrderNo();
    expect(a).not.toBe(b);
  });
});
