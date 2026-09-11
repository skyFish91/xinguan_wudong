import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/api/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 密码登录（添加模拟登录）
  const login = async (credentials) => {
    try {
      // 真实登录
      const res = await request.post('/app/user/login/password', {
        phone: credentials.phone,
        password: credentials.password
      })

      // 后端返回格式: { code: 1000, data: { token: '...', ...userInfo } }
      // request拦截器已经提取了data，所以这里res就是data
      if (res && res.token) {
        token.value = res.token
        userInfo.value = res
        localStorage.setItem('token', res.token)
        localStorage.setItem('userInfo', JSON.stringify(res))
        return res
      } else {
        throw new Error('登录失败：未获取到token')
      }
    } catch (error) {
      throw error
    }
  }

  // 手机验证码登录（添加模拟登录）
  const loginByPhone = async (phone, smsCode) => {
    try {
      // 模拟登录：手机号 13800138000，验证码 123456
      if (phone === '13800138000' && smsCode === '123456') {
        const mockData = {
          token: 'mock-token-' + Date.now(),
          id: 1,
          phone: '13800138000',
          nickname: '默认用户',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        }
        token.value = mockData.token
        userInfo.value = mockData
        localStorage.setItem('token', mockData.token)
        localStorage.setItem('userInfo', JSON.stringify(mockData))
        return mockData
      }

      // 真实登录
      const data = await request.post('/app/user/login/phone', {
        phone,
        smsCode
      })
      token.value = data.token
      userInfo.value = data
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    } catch (error) {
      throw error
    }
  }

  // 注册（使用手机号验证码登录，自动注册）
  const register = async (userData) => {
    try {
      const data = await request.post('/app/user/login/phone', {
        phone: userData.phone,
        smsCode: userData.code
      })
      token.value = data.token
      userInfo.value = data
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      throw error
    }
  }

  // 发送验证码（模拟发送）
  const sendCode = async (phone) => {
    try {
      // 模拟发送验证码
      if (phone === '13800138000') {
        console.log('模拟发送验证码成功，验证码为：123456')
        return
      }

      // 真实发送
      const captchaData = await request.get('/app/user/login/captcha', {
        params: { width: 150, height: 40 }
      })

      await request.post('/app/user/login/smsCode', {
        phone,
        captchaId: captchaData.id,
        code: '1234'
      })
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const data = await request.get('/app/user/info/person')
      userInfo.value = data
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    } catch (error) {
      throw error
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 初始化（页面加载时调用）
  const init = async () => {
    if (token.value) {
      try {
        // 先从 localStorage 恢复用户信息
        const savedUserInfo = localStorage.getItem('userInfo')
        if (savedUserInfo) {
          userInfo.value = JSON.parse(savedUserInfo)
        }

        // 如果不是模拟 token，尝试从服务器获取
        if (!token.value.startsWith('mock-token-')) {
          await getUserInfo()
        }
      } catch (error) {
        // token 失效，清除本地数据
        logout()
      }
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    loginByPhone,
    register,
    sendCode,
    getUserInfo,
    logout,
    init
  }
})
