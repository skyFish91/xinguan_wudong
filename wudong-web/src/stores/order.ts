import { ref, computed } from 'vue'

export interface OrderTraveler {
  name: string
  idCard: string
  phone: string
}

export interface Order {
  id: string
  orderNo: string
  // 下单对象
  targetType: 'ticket' | 'route'
  targetId: number
  scenicId?: number
  scenicName: string
  ticketName: string
  image: string
  // 价格（单位：分，与后端一致）
  unitPrice: number
  quantity: number
  totalPrice: number
  // 使用信息
  travelDate: string
  travelers: OrderTraveler[]
  contactName: string
  contactPhone: string
  remark: string
  // 状态流转
  status: 'unpaid' | 'paid' | 'used' | 'cancelled' | 'refunding' | 'refunded'
  payMethod?: 'wechat' | 'alipay' | 'unionpay'
  // 电子票
  verifyCode?: string
  createdAt: string
  paidAt?: string
  usedAt?: string
  cancelledAt?: string
  // 支付截止时间（时间戳，毫秒）
  payDeadline: number
}

const STORAGE_KEY = 'wudong_orders'

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const orders = ref<Order[]>(loadOrders())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
}

function genOrderNo(): string {
  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const randPart = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `WD${datePart}${pad(now.getHours())}${pad(now.getMinutes())}${randPart}`
}

function genVerifyCode(): string {
  // 12 位核销码，4-4-4 分段便于人工录入
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`
}

function nowText(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

export function useOrderStore() {
  /**
   * 创建订单（待支付），返回订单
   */
  function createOrder(payload: {
    targetType: 'ticket' | 'route'
    targetId: number
    scenicId?: number
    scenicName: string
    ticketName: string
    image: string
    unitPrice: number
    quantity: number
    travelDate: string
    travelers: OrderTraveler[]
    contactName: string
    contactPhone: string
    remark?: string
  }): Order {
    const order: Order = {
      id: String(Date.now()),
      orderNo: genOrderNo(),
      targetType: payload.targetType,
      targetId: payload.targetId,
      scenicId: payload.scenicId,
      scenicName: payload.scenicName,
      ticketName: payload.ticketName,
      image: payload.image,
      unitPrice: payload.unitPrice,
      quantity: payload.quantity,
      totalPrice: payload.unitPrice * payload.quantity,
      travelDate: payload.travelDate,
      travelers: payload.travelers,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      remark: payload.remark || '',
      status: 'unpaid',
      createdAt: nowText(),
      // 30 分钟支付时限
      payDeadline: Date.now() + 30 * 60 * 1000
    }

    orders.value.unshift(order)
    persist()
    return order
  }

  function getOrder(id: string): Order | undefined {
    return orders.value.find(o => o.id === id)
  }

  function getOrderByNo(orderNo: string): Order | undefined {
    return orders.value.find(o => o.orderNo === orderNo)
  }

  /**
   * 支付订单，成功后生成电子票核销码
   */
  function payOrder(id: string, payMethod: Order['payMethod']): Order | undefined {
    const order = getOrder(id)
    if (!order || order.status !== 'unpaid') return order

    order.status = 'paid'
    order.payMethod = payMethod
    order.paidAt = nowText()
    order.verifyCode = genVerifyCode()
    persist()
    return order
  }

  function cancelOrder(id: string): Order | undefined {
    const order = getOrder(id)
    if (!order || (order.status !== 'unpaid' && order.status !== 'paid')) return order

    order.status = 'cancelled'
    order.cancelledAt = nowText()
    persist()
    return order
  }

  function applyRefund(id: string): Order | undefined {
    const order = getOrder(id)
    if (!order || order.status !== 'paid') return order

    order.status = 'refunding'
    persist()
    return order
  }

  /**
   * 标记为已使用（模拟景区核销）
   */
  function useOrder(id: string): Order | undefined {
    const order = getOrder(id)
    if (!order || order.status !== 'paid') return order

    order.status = 'used'
    order.usedAt = nowText()
    persist()
    return order
  }

  const unpaidCount = computed(
    () => orders.value.filter(o => o.status === 'unpaid').length
  )

  return {
    orders,
    createOrder,
    getOrder,
    getOrderByNo,
    payOrder,
    cancelOrder,
    applyRefund,
    useOrder,
    unpaidCount
  }
}
