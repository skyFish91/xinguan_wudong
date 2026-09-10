import axios from 'axios'

const API_BASE = '/api'

const request = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// 景区接口
export const scenicApi = {
  list: (params?: any) => request.get('/travel/scenic/list', { params }),
  detail: (id: number) => request.get(`/travel/scenic/${id}`)
}

// 路线接口
export const routeApi = {
  list: (params?: any) => request.get('/travel/route/list', { params }),
  detail: (id: number) => request.get(`/travel/route/${id}`)
}

// 票种接口
export const ticketApi = {
  list: (params: any) => request.get('/travel/ticket/list', { params }),
  stock: (params: any) => request.get('/travel/ticket/stock', { params })
}

// GPS 工具
export const gpsUtils = {
  getCurrentPosition: (): Promise<{ lng: number; lat: number; city: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lng: 106.71, lat: 26.57, city: '贵阳' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
            city: '贵阳'
          })
        },
        () => {
          resolve({ lng: 106.71, lat: 26.57, city: '贵阳' })
        }
      )
    })
  },

  calculateDistance: (lng1: number, lat1: number, lng2: number, lat2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
  }
}
