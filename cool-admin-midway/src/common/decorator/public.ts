/**
 * 免鉴权标记（设计文档 §6.2）
 *
 * 用法：在 Controller 方法上加 @Public()，AuthGuard 会跳过 token 校验。
 * 登录、注册、验证码、商品/内容浏览等无需登录的接口都用它。
 */
export const PUBLIC_META_KEY = 'wudong:public';

export function Public(): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(
      PUBLIC_META_KEY,
      true,
      target.constructor,
      propertyKey
    );
    return descriptor;
  };
}

/** 判断某个 Controller 方法是否标记了免鉴权 */
export function isPublicMethod(clz: any, methodName: string): boolean {
  if (!clz || !methodName) return false;
  try {
    return !!Reflect.getMetadata(PUBLIC_META_KEY, clz, methodName);
  } catch {
    return false;
  }
}
