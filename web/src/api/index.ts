import request from './request';

const scenicApi = {
  list: (params?: Record<string, unknown>) => request.get('/travel/scenic/list', { params }),
  detail: (id: number) => request.get(`/travel/scenic/${id}`),
};

const routeApi = {
  list: (params?: Record<string, unknown>) => request.get('/travel/route/list', { params }),
  detail: (id: number) => request.get(`/travel/route/${id}`),
};

const ticketApi = {
  list: (params: Record<string, unknown>) => request.get('/travel/ticket/list', { params }),
  stock: (params: Record<string, unknown>) => request.get('/travel/ticket/stock', { params }),
};

const gpsUtils = {
  calculateDistance(lng1: number, lat1: number, lng2: number, lat2: number) {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  },
  getCurrentPosition(): Promise<{ lng: number; lat: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('当前浏览器不支持定位'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve({ lng: position.coords.longitude, lat: position.coords.latitude }),
        reject,
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  },
};

export { scenicApi, routeApi, ticketApi, gpsUtils };
