import { defineStore } from 'pinia';

/** 解析 JWT 的 exp，判断本地 token 是否仍然有效（过期/损坏都算无效） */
function hasValidToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// 启动时清理过期/损坏的缓存：否则 isLogin 仍为 true，顶栏会带着失效 token 请求受保护接口，全站刷 401
const cachedToken = localStorage.getItem('token');
const initialToken = hasValidToken(cachedToken) ? cachedToken : '';
if (!initialToken) {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
}

/** 用户登录状态 */
export const useUserStore = defineStore('user', {
  state: () => ({
    token: initialToken,
    userInfo: initialToken ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null,
  }),
  getters: {
    isLogin: (state) => !!state.token,
  },
  actions: {
    setLogin(token: string, userInfo: any) {
      this.token = token;
      this.userInfo = userInfo;
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
  },
});
