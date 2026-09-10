import { ref, reactive } from 'vue'

export interface Review {
  id: string
  // 评价对象
  targetType: 'scenic' | 'route'
  targetId: number
  targetName: string
  targetImage: string
  // 关联订单
  orderId?: string
  orderNo?: string
  // 评价内容
  rating: number // 1-5 星
  content: string
  images: string[] // 图片 URL 列表
  // 标签
  tags: string[]
  // 用户信息
  userId: number
  username: string
  userAvatar?: string
  // 状态
  status: 'normal' | 'hidden' // 正常/已隐藏
  // 点赞数
  likes: number
  // 时间
  createdAt: string
}

const STORAGE_KEY = 'wudong_reviews'

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const reviews = ref<Review[]>(loadReviews())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews.value))
}

export function useReviewStore() {
  /**
   * 添加评价
   */
  function addReview(payload: {
    targetType: 'scenic' | 'route'
    targetId: number
    targetName: string
    targetImage: string
    orderId?: string
    orderNo?: string
    rating: number
    content: string
    images?: string[]
    tags?: string[]
    userId: number
    username: string
    userAvatar?: string
  }): Review {
    const review: Review = {
      id: `review_${Date.now()}`,
      targetType: payload.targetType,
      targetId: payload.targetId,
      targetName: payload.targetName,
      targetImage: payload.targetImage,
      orderId: payload.orderId,
      orderNo: payload.orderNo,
      rating: payload.rating,
      content: payload.content,
      images: payload.images || [],
      tags: payload.tags || [],
      userId: payload.userId,
      username: payload.username,
      userAvatar: payload.userAvatar,
      status: 'normal',
      likes: 0,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    }

    reviews.value.unshift(review)
    persist()
    return review
  }

  /**
   * 获取指定对象的评价列表
   */
  function getReviewsByTarget(
    targetType: 'scenic' | 'route',
    targetId: number
  ): Review[] {
    return reviews.value.filter(
      r =>
        r.targetType === targetType &&
        r.targetId === targetId &&
        r.status === 'normal'
    )
  }

  /**
   * 获取用户的评价列表
   */
  function getReviewsByUser(userId: number): Review[] {
    return reviews.value.filter(r => r.userId === userId)
  }

  /**
   * 检查用户是否已评价过某订单
   */
  function hasReviewed(orderId: string): boolean {
    return reviews.value.some(r => r.orderId === orderId)
  }

  /**
   * 删除评价
   */
  function deleteReview(id: string) {
    const index = reviews.value.findIndex(r => r.id === id)
    if (index > -1) {
      reviews.value.splice(index, 1)
      persist()
    }
  }

  /**
   * 点赞/取消点赞
   */
  function toggleLike(id: string, isLike: boolean) {
    const review = reviews.value.find(r => r.id === id)
    if (review) {
      review.likes += isLike ? 1 : -1
      persist()
    }
  }

  /**
   * 获取目标的平均评分和评价数
   */
  function getTargetStats(targetType: 'scenic' | 'route', targetId: number) {
    const targetReviews = getReviewsByTarget(targetType, targetId)
    const total = targetReviews.length
    const avgRating = total > 0
      ? targetReviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0

    return {
      total,
      avgRating: Math.round(avgRating * 10) / 10
    }
  }

  return reactive({
    reviews,
    addReview,
    getReviewsByTarget,
    getReviewsByUser,
    hasReviewed,
    deleteReview,
    toggleLike,
    getTargetStats
  })
}
