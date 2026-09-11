import { ref, computed, reactive } from 'vue'

export interface CartItem {
  id: string
  // 商品信息
  targetType: 'ticket' | 'route'
  targetId: number
  scenicId?: number
  scenicName: string
  ticketName: string
  image: string
  unitPrice: number
  // 购买数量
  quantity: number
  // 可选的游玩日期（加入购物车时可能还没选）
  travelDate?: string
  // 是否选中（用于批量结算）
  selected: boolean
  // 加入时间
  addedAt: string
}

const STORAGE_KEY = 'wudong_cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const items = ref<CartItem[]>(loadCart())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
}

export function useCartStore() {
  /**
   * 添加商品到购物车
   */
  function addItem(payload: {
    targetType: 'ticket' | 'route'
    targetId: number
    scenicId?: number
    scenicName: string
    ticketName: string
    image: string
    unitPrice: number
    quantity?: number
    travelDate?: string
  }) {
    // 检查是否已存在（同商品同日期视为重复）
    const existing = items.value.find(
      item =>
        item.targetType === payload.targetType &&
        item.targetId === payload.targetId &&
        item.travelDate === payload.travelDate
    )

    if (existing) {
      // 已存在，增加数量
      existing.quantity += payload.quantity || 1
    } else {
      // 新增
      items.value.push({
        id: `${payload.targetType}_${payload.targetId}_${Date.now()}`,
        targetType: payload.targetType,
        targetId: payload.targetId,
        scenicId: payload.scenicId,
        scenicName: payload.scenicName,
        ticketName: payload.ticketName,
        image: payload.image,
        unitPrice: payload.unitPrice,
        quantity: payload.quantity || 1,
        travelDate: payload.travelDate,
        selected: true,
        addedAt: new Date().toLocaleString('zh-CN', { hour12: false })
      })
    }

    persist()
  }

  /**
   * 更新购物车项的数量
   */
  function updateQuantity(id: string, quantity: number) {
    const item = items.value.find(i => i.id === id)
    if (!item) return

    if (quantity <= 0) {
      removeItem(id)
    } else {
      item.quantity = quantity
      persist()
    }
  }

  /**
   * 更新购物车项的游玩日期
   */
  function updateTravelDate(id: string, date: string) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.travelDate = date
      persist()
    }
  }

  /**
   * 切换选中状态
   */
  function toggleSelected(id: string) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.selected = !item.selected
      persist()
    }
  }

  /**
   * 全选/取消全选
   */
  function toggleAll(selected: boolean) {
    items.value.forEach(item => {
      item.selected = selected
    })
    persist()
  }

  /**
   * 移除购物车项
   */
  function removeItem(id: string) {
    const index = items.value.findIndex(i => i.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
      persist()
    }
  }

  /**
   * 批量删除选中项
   */
  function removeSelected() {
    items.value = items.value.filter(i => !i.selected)
    persist()
  }

  /**
   * 清空购物车
   */
  function clear() {
    items.value = []
    persist()
  }

  // 计算属性
  const totalCount = computed(() => items.value.length)

  const selectedItems = computed(() => items.value.filter(i => i.selected))

  const selectedCount = computed(() => selectedItems.value.length)

  const selectedTotal = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  )

  const allSelected = computed(
    () => items.value.length > 0 && items.value.every(i => i.selected)
  )

  // 用 reactive 包一层：这样在模板里写 cartStore.totalCount 会自动解包成数值，
  // 而不是拿到 Ref 对象（那会导致徽章显示 NaN、列表渲染不出来）
  return reactive({
    items,
    totalCount,
    selectedItems,
    selectedCount,
    selectedTotal,
    allSelected,
    addItem,
    updateQuantity,
    updateTravelDate,
    toggleSelected,
    toggleAll,
    removeItem,
    removeSelected,
    clear
  })
}
