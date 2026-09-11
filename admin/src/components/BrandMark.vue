<template>
  <svg
    class="brand-mark"
    :class="`tone-${tone}`"
    viewBox="0 0 64 64"
    :width="size"
    :height="size"
    role="img"
    :aria-label="label"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient :id="bgDark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a68a8" />
        <stop offset="55%" stop-color="#22467e" />
        <stop offset="100%" stop-color="#16305a" />
      </linearGradient>
      <linearGradient :id="bgLight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e4ecf9" />
      </linearGradient>
    </defs>

    <!-- 底：靛蓝渐变（mono 时不画底） -->
    <rect
      v-if="tone !== 'mono'"
      width="64"
      height="64"
      rx="16"
      :fill="`url(#${tone === 'light' ? bgLight : bgDark})`"
    />

    <!-- 铜鼓太阳纹：外圈同心环（不加内圈，小尺寸下会糊成一团） -->
    <g class="mk-stroke" fill="none">
      <circle cx="32" cy="32" r="21" stroke-width="1.6" opacity="0.3" />
    </g>

    <!-- 铜鼓太阳纹：12 道光芒 -->
    <g class="mk-stroke" stroke-width="1.9" stroke-linecap="round" opacity="0.78">
      <path d="M53 32 L56.5 32" />
      <path d="M50.19 42.5 L53.2 44.25" />
      <path d="M42.5 50.19 L44.25 53.2" />
      <path d="M32 53 L32 56.5" />
      <path d="M21.5 50.19 L19.75 53.2" />
      <path d="M13.81 42.5 L10.8 44.25" />
      <path d="M11 32 L7.5 32" />
      <path d="M13.81 21.5 L10.8 19.75" />
      <path d="M21.5 13.81 L19.75 10.8" />
      <path d="M32 11 L32 7.5" />
      <path d="M42.5 13.81 L44.25 10.8" />
      <path d="M50.19 21.5 L53.2 19.75" />
    </g>

    <!-- 蝴蝶妈妈：四翅 -->
    <g class="mk-fill">
      <path d="M30 30.5C23 23.5 16.4 21 14.4 25.4C12.4 29.8 19 34.8 30 34.8Z" />
      <path d="M34 30.5C41 23.5 47.6 21 49.6 25.4C51.6 29.8 45 34.8 34 34.8Z" />
      <path d="M30 36.2C23.8 39 19.2 43.6 22.4 47.2C25.6 50.8 30.6 44 30.6 37.6Z" />
      <path d="M34 36.2C40.2 39 44.8 43.6 41.6 47.2C38.4 50.8 33.4 44 33.4 37.6Z" />
    </g>

    <!-- 蝴蝶妈妈：身体与头 -->
    <ellipse class="mk-fill" cx="32" cy="34.4" rx="2.3" ry="7.2" />
    <circle class="mk-fill" cx="32" cy="25.4" r="2.7" />

    <!-- 银饰银角式触须 -->
    <g class="mk-stroke" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.9">
      <path d="M30.4 23.4C27.6 18.6 24.4 17.4 22.2 18.6" />
      <path d="M33.6 23.4C36.4 18.6 39.6 17.4 41.8 18.6" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 尺寸（px） */
    size?: number | string;
    /**
     * brand：靛蓝底 + 白标（默认，用于浅色页面）
     * light：白/浅靛底 + 靛蓝标（用于深色或图片背景）
     * mono ：无底，跟随 currentColor（极小尺寸或纯文字场景）
     */
    tone?: 'brand' | 'light' | 'mono';
    label?: string;
  }>(),
  {
    size: 36,
    tone: 'brand',
    label: '乌东文旅',
  }
);

/** 每个实例一套唯一 id，避免同页多个 logo 的渐变互相覆盖 */
const uid = Math.random().toString(36).slice(2, 9);
const bgDark = `wdLogoDark-${uid}`;
const bgLight = `wdLogoLight-${uid}`;
</script>

<style scoped>
.brand-mark {
  flex-shrink: 0;
  display: block;
  border-radius: 16px;
  --mk-fg: #ffffff;
}
.tone-brand {
  box-shadow: 0 6px 16px rgba(var(--wd-brand-rgb), 0.28);
}
.tone-light {
  --mk-fg: #22467e;
  box-shadow: 0 6px 18px rgba(9, 20, 40, 0.22);
}
.tone-mono {
  --mk-fg: currentColor;
}

/* 颜色统一走 CSS，而不是 SVG 属性 —— var() 在 presentation attribute 里不生效 */
.mk-fill {
  fill: var(--mk-fg);
}
.mk-stroke {
  stroke: var(--mk-fg);
}
</style>
