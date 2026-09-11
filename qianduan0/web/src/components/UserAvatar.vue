<template>
  <!--
    头像统一入口：有真实头像就用图片（加载失败自动降级），
    没有就用本地生成的卡通头像，避免出现一堆字母占位或外链挂掉的白块。
  -->
  <CartoonAvatar v-if="!useImage" :seed="seed" :size="size" :ring="ring" :label="label" />
  <img
    v-else
    class="wd-user-avatar"
    :src="src as string"
    :alt="label"
    :width="size"
    :height="size"
    :style="{ width: `${size}px`, height: `${size}px` }"
    @error="broken = true"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CartoonAvatar from './CartoonAvatar.vue';

const props = withDefaults(
  defineProps<{
    /** 用户上传的头像地址；为空或加载失败则回退到卡通头像 */
    src?: string | null;
    /** 决定卡通头像长相的种子，传用户 id 最稳（保证同一个人每次一样） */
    seed?: string | number;
    size?: number;
    /** 加白描边，用于压在封面图或深色底上 */
    ring?: boolean;
    label?: string;
  }>(),
  {
    src: '',
    seed: '',
    size: 40,
    ring: false,
    label: '用户头像',
  }
);

const broken = ref(false);
const useImage = computed(() => !!props.src && !broken.value);
</script>

<style scoped>
.wd-user-avatar {
  display: block;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  background: var(--wd-silver-soft, #eef1f6);
}
</style>
