<template>
  <div class="wd-empty">
    <!-- 插画：苗乡山景线稿，风格统一 -->
    <svg
      class="wd-empty-art"
      viewBox="0 0 220 152"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- 背景光晕 -->
      <ellipse cx="110" cy="86" rx="92" ry="52" fill="url(#wdEmptyGlow)" />

      <!-- 远山 -->
      <path
        d="M6 116 L52 62 Q58 56 64 62 L96 100 L118 76 Q124 70 130 76 L168 116 Z"
        fill="#e9eefa"
      />
      <path
        d="M66 116 L112 58 Q118 52 124 58 L166 116 Z"
        fill="#dfe8f6"
      />

      <!-- 近山 -->
      <path
        d="M0 124 L40 88 Q46 83 52 88 L84 124 Z"
        fill="#d3dff0"
      />
      <path
        d="M132 124 L166 92 Q172 87 178 92 L214 124 Z"
        fill="#d3dff0"
      />

      <!-- 地面 -->
      <path d="M16 124 H204" stroke="#c0cde2" stroke-width="2.5" stroke-linecap="round" />

      <!-- 吊脚楼剪影 -->
      <g v-if="variant !== 'order' && variant !== 'network'" stroke="#a8b8cd" stroke-width="2.4" stroke-linecap="round">
        <path d="M92 124 V104" />
        <path d="M128 124 V104" />
        <path d="M86 104 L110 92 L134 104" stroke-linejoin="round" />
        <path d="M94 104 V96 M110 104 V96 M126 104 V96" stroke-width="1.4" />
      </g>

      <!-- 云 -->
      <g opacity="0.9">
        <path
          d="M42 44c0-5 4-9 9-9 3 0 6 2 8 4 1-4 5-7 9-7 6 0 10 4 10 10 0 4-3 7-7 7H49c-4 0-7-2-7-5Z"
          fill="#eef3fb"
        />
        <path
          d="M150 34c0-4 3-7 7-7 2 0 4 1 5 3 1-3 4-5 7-5 4 0 7 3 7 7 0 3-2 5-5 5h-16c-3 0-5-1-5-3Z"
          fill="#eef3fb"
        />
      </g>

      <!-- 太阳 -->
      <circle cx="178" cy="30" r="15" fill="url(#wdEmptySun)" />

      <!-- 放大镜（搜索无结果） -->
      <g v-if="variant === 'search'">
        <circle cx="150" cy="102" r="26" fill="#ffffff" fill-opacity="0.72" stroke="#22467e" stroke-width="3.4" />
        <circle cx="150" cy="102" r="26" fill="none" stroke="#22467e" stroke-width="3.4" opacity="0.28" />
        <path d="M169 121 L186 138" stroke="#22467e" stroke-width="5.4" stroke-linecap="round" />
        <path d="M138 104 L162 104" stroke="#a9c2e0" stroke-width="3" stroke-linecap="round" />
        <path d="M138 94 L154 94" stroke="#a9c2e0" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- 清单（订单为空） -->
      <g v-if="variant === 'order'">
        <rect x="80" y="52" width="60" height="76" rx="9" fill="#ffffff" stroke="#c0cde2" stroke-width="2.6" />
        <path d="M92 74 H128" stroke="#c0cde2" stroke-width="3" stroke-linecap="round" />
        <path d="M92 88 H128" stroke="#d5e0f0" stroke-width="3" stroke-linecap="round" />
        <path d="M92 102 H114" stroke="#d5e0f0" stroke-width="3" stroke-linecap="round" />
        <circle cx="133" cy="103" r="13" fill="#22467e" />
        <path d="M133 97 V104" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        <circle cx="133" cy="109" r="1.9" fill="#fff" />
      </g>

      <!-- 断网（加载失败） -->
      <g v-if="variant === 'network'">
        <path
          d="M74 92c0-9 7-16 16-16 5 0 10 2 13 6 2-6 8-10 15-10 10 0 17 7 17 17 0 7-5 12-12 12H86c-7 0-12-4-12-9Z"
          fill="#ffffff"
          stroke="#c0cde2"
          stroke-width="2.6"
        />
        <path d="M96 116 L110 104 L124 116" stroke="#22467e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M110 104 V128" stroke="#22467e" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 6" />
      </g>

      <defs>
        <radialGradient id="wdEmptyGlow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stop-color="#f4f7fd" />
          <stop offset="100%" stop-color="#f4f7fd" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="wdEmptySun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a9c2e0" />
          <stop offset="100%" stop-color="#3a68a8" />
        </linearGradient>
      </defs>
    </svg>

    <div class="wd-empty-title">{{ title }}</div>
    <p v-if="desc" class="wd-empty-desc">{{ desc }}</p>

    <div v-if="$slots.default" class="wd-empty-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 插画形态 */
    variant?: 'default' | 'search' | 'order' | 'network';
    title?: string;
    desc?: string;
  }>(),
  {
    variant: 'default',
    title: '这里还什么都没有',
    desc: '',
  }
);
</script>
