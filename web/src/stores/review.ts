import { defineStore } from 'pinia';

export interface LocalReview {
  id: number;
  targetType: string;
  targetId: number;
  rating: number;
  content: string;
  username: string;
  userAvatar: string;
  createdAt: string;
  tags: string[];
  images: string[];
  [key: string]: unknown;
}

type NewLocalReview = Omit<LocalReview, 'id' | 'createdAt'> & { createdAt?: string };

export const useReviewStore = defineStore('review', {
  state: () => ({ reviews: [] as LocalReview[] }),
  actions: {
    addReview(review: NewLocalReview) {
      this.reviews.unshift({
        ...review,
        id: Date.now(),
        createdAt: review.createdAt || new Date().toISOString(),
        tags: review.tags || [],
        images: review.images || [],
        username: review.username || '游客',
        userAvatar: review.userAvatar || '',
      });
    },
  },
  getters: {
    getReviewsByTarget: state => (targetType: string, targetId: number) =>
      state.reviews.filter(review => review.targetType === targetType && review.targetId === targetId),
    getTargetStats: state => (targetType: string, targetId: number) => {
      const reviews = state.reviews.filter(
        review => review.targetType === targetType && review.targetId === targetId
      );
      const total = reviews.length;
      const avgRating = total
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
        : 0;
      return { total, avgRating };
    },
  },
});
