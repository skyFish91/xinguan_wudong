<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    class="cartoon-avatar"
    role="img"
    aria-label="用户头像"
  >
    <defs>
      <linearGradient :id="bgId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" :stop-color="palette.bg1" />
        <stop offset="100%" :stop-color="palette.bg2" />
      </linearGradient>
      <linearGradient :id="crownId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cdd6e4" />
      </linearGradient>
    </defs>

    <!-- 背景圆 -->
    <circle cx="32" cy="32" r="32" :fill="`url(#${bgId})`" />

    <!-- 身体/衣领 -->
    <path d="M7 64 C9 49 22 45 32 45 C42 45 55 49 57 64 Z" :fill="palette.clothes" />
    <path d="M26 46 L32 54 L38 46 Z" :fill="palette.clothesDark" />

    <!-- 后层头发 -->
    <circle cx="32" cy="29" r="19" :fill="palette.hair" />

    <!-- 脸 -->
    <ellipse cx="32" cy="33" rx="16" ry="14.5" fill="#ffe3c4" />

    <!-- 耳朵 -->
    <circle cx="16" cy="34" r="2.6" fill="#ffd3ab" />
    <circle cx="48" cy="34" r="2.6" fill="#ffd3ab" />

    <!-- 刘海 -->
    <path
      d="M16.5 27 C16.5 20 22 15.5 27.5 15.5 C30 15.5 31.5 16.5 32.5 18.5 C33.5 16.5 35 15.5 37.5 15.5 C43 15.5 47.5 20 47.5 27 C43 23.5 38 22.8 32 22.8 C26 22.8 20.5 23.5 16.5 27 Z"
      :fill="palette.hair"
    />

    <!-- 苗族银饰头冠 -->
    <g>
      <!-- 银冠主体 -->
      <path d="M20 20 C22 13 42 13 44 20 C40 16.5 36 15.5 32 15.5 C28 15.5 24 16.5 20 20 Z" :fill="`url(#${crownId})`" />
      <!-- 银冠中央银花 -->
      <g transform="translate(32, 16.5)" fill="#f4f7fb" stroke="#b8c4d4" stroke-width="0.5">
        <circle cx="0" cy="-3.2" r="1.6" />
        <circle cx="3" cy="-1" r="1.6" />
        <circle cx="1.9" cy="2.6" r="1.6" />
        <circle cx="-1.9" cy="2.6" r="1.6" />
        <circle cx="-3" cy="-1" r="1.6" />
        <circle cx="0" cy="0" r="1.4" fill="#ffffff" stroke="none" />
      </g>
      <!-- 银冠垂坠 -->
      <g stroke="#e8eef5" stroke-width="1.2" fill="none">
        <path d="M20.5 19 L18.5 25" />
        <path d="M43.5 19 L45.5 25" />
      </g>
      <circle cx="18.5" cy="26" r="1.4" fill="#f4f7fb" stroke="#b8c4d4" stroke-width="0.5" />
      <circle cx="45.5" cy="26" r="1.4" fill="#f4f7fb" stroke="#b8c4d4" stroke-width="0.5" />
    </g>

    <!-- 眼睛 -->
    <circle cx="26.5" cy="34.5" r="2.3" fill="#3a2a1a" />
    <circle cx="37.5" cy="34.5" r="2.3" fill="#3a2a1a" />
    <circle cx="27.3" cy="33.7" r="0.9" fill="#ffffff" />
    <circle cx="38.3" cy="33.7" r="0.9" fill="#ffffff" />

    <!-- 眉毛 -->
    <path d="M23.5 29.5 Q26.5 28.3 29.5 29.5" stroke="#5a4330" stroke-width="1" fill="none" stroke-linecap="round" />
    <path d="M34.5 29.5 Q37.5 28.3 40.5 29.5" stroke="#5a4330" stroke-width="1" fill="none" stroke-linecap="round" />

    <!-- 腮红 -->
    <ellipse cx="22" cy="39.5" rx="3" ry="1.8" fill="#ffb3a7" opacity="0.55" />
    <ellipse cx="42" cy="39.5" rx="3" ry="1.8" fill="#ffb3a7" opacity="0.55" />

    <!-- 嘴巴 -->
    <path d="M29.5 42.5 Q32 45 34.5 42.5" stroke="#c96f5a" stroke-width="1.4" fill="none" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';

interface Props {
  size?: number;
  /** admin | clothing | food | hotel | travel */
  variant?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  variant: 'admin',
});

const uid = useId();
const bgId = `bg-${uid}`;
const crownId = `crown-${uid}`;

const PALETTES: Record<string, { bg1: string; bg2: string; clothes: string; clothesDark: string; hair: string }> = {
  admin:    { bg1: '#2d4a7c', bg2: '#0e8c7e', clothes: '#0e8c7e', clothesDark: '#0a6f63', hair: '#2b2018' },
  clothing: { bg1: '#0e8c7e', bg2: '#0a6f63', clothes: '#1f9d8b', clothesDark: '#178073', hair: '#2b2018' },
  food:     { bg1: '#c08a3e', bg2: '#9c6b28', clothes: '#d99a4e', clothesDark: '#b87b33', hair: '#2b2018' },
  hotel:    { bg1: '#4a6ba8', bg2: '#2d4a7c', clothes: '#5b7fc0', clothesDark: '#46649d', hair: '#2b2018' },
  travel:   { bg1: '#7a5a9e', bg2: '#5a3d7d', clothes: '#8d6bb5', clothesDark: '#6e4f93', hair: '#2b2018' },
  user:     { bg1: '#8d9bb0', bg2: '#64748b', clothes: '#7c8da6', clothesDark: '#5f6e85', hair: '#2b2018' },
};

const palette = computed(() => PALETTES[props.variant] ?? PALETTES.admin);
</script>

<style scoped>
.cartoon-avatar {
  display: block;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}
</style>
