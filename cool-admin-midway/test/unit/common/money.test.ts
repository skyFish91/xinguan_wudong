import { yuanToFen, fenToYuan } from '../../../src/common/money';

describe('money', () => {
  it('元转分：精度用 round 而非截断', () => {
    expect(yuanToFen(0.1)).toBe(10);
    expect(yuanToFen(19.9)).toBe(1990);
    expect(yuanToFen('12.34')).toBe(1234);
    expect(yuanToFen(99)).toBe(9900);
  });

  it('分转元', () => {
    expect(fenToYuan(1990)).toBe(19.9);
    expect(fenToYuan(1234)).toBe(12.34);
  });

  it('非法输入抛错', () => {
    expect(() => yuanToFen('abc')).toThrow('金额格式错误');
  });
});
