<template>
  <div class="auth-shell">
    <!-- ================= 左：品牌实景 ================= -->
    <aside class="auth-visual">
      <img :src="visualImage" alt="乌东苗寨风光" />
      <!-- 深靛遮罩：压住照片亮度，保证白字可读，同时把画面统一到品牌色 -->
      <div class="visual-veil"></div>
      <!-- 苗族纹样肌理 -->
      <div class="wd-miao-pattern"></div>
      <div class="visual-glow"></div>

      <div class="visual-inner">
        <router-link to="/" class="brand">
          <BrandMark :size="42" tone="light" />
          <span class="brand-text">
            <b>乌东文旅</b>
            <i>WUDONG · MIAO</i>
          </span>
        </router-link>

        <div class="visual-copy">
          <h2 class="visual-title">{{ visualTitle }}</h2>
          <p class="visual-desc">{{ visualDesc }}</p>

          <div class="visual-chips">
            <span chip>衣 · 非遗好物</span>
            <span chip>食 · 苗乡风味</span>
            <span chip>住 · 山间民宿</span>
            <span chip>行 · 山水线路</span>
          </div>
        </div>

        <router-link to="/" class="back-home">
          <span aria-hidden="true">←</span> 暂不登录，先逛逛
        </router-link>
      </div>
    </aside>

    <!-- ================= 右：表单 ================= -->
    <main class="auth-main">
      <div class="auth-deco" aria-hidden="true">
        <span class="deco-ring"></span>
        <span class="deco-ring deco-ring-2"></span>
      </div>

      <div class="auth-card wd-rise">
        <header class="auth-head">
          <span class="auth-eyebrow">{{ eyebrow }}</span>
          <h1 class="auth-title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-sub">{{ subtitle }}</p>
        </header>

        <slot />

        <footer class="auth-foot">
          <slot name="footer" />
        </footer>
      </div>

      <p class="auth-note">
        登录即代表同意
        <a href="javascript:void(0)">用户协议</a>
        与
        <a href="javascript:void(0)">隐私政策</a>
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import BrandMark from './BrandMark.vue';
import { PHOTO_LARGE } from '../utils/media';

withDefaults(
  defineProps<{
    /** 右侧卡片眉题 */
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    /** 左侧品牌文案 */
    visualTitle?: string;
    visualDesc?: string;
    /** 左侧实景图，默认用 4K 云海全景（此处是全屏大图，必须 ≥2048px） */
    visualImage?: string;
  }>(),
  {
    eyebrow: 'WUDONG CULTURAL TOURISM',
    title: '欢迎回来',
    subtitle: '',
    visualTitle: '云雾深处的苗寨日常',
    visualDesc: '梯田、长桌宴、蜡染与银饰——把乌东的好物与风景，装进一次旅程。',
    visualImage: PHOTO_LARGE.hero,
  }
);
</script>

<style scoped>
.auth-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  min-height: 100vh;
  /* 抵消 .app-content 为固定导航预留的 68px，让分屏真正铺满一屏
     （app-content 的 padding 是恒定值，这里用等量负 margin 抵消，
       切换页面时不会有任何位置变化，所以不会「顿一下」） */
  margin-top: calc(-1 * var(--wd-nav-h));
  /* 压住固定导航：否则导航退场的那 0.2s 会在登录页顶部擦过一道 */
  position: relative;
  z-index: 300;
}

/* ---------------- 左：实景 ---------------- */
.auth-visual {
  position: relative;
  overflow: hidden;
  background: var(--wd-brand-900);
}
.auth-visual img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
}
/* 深靛遮罩：从左上到右下加深，左下最暗以托住文案 */
.visual-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
      158deg,
      rgba(11, 26, 51, 0.72) 0%,
      rgba(11, 26, 51, 0.34) 42%,
      rgba(9, 21, 42, 0.86) 100%
    ),
    radial-gradient(760px 420px at 8% 96%, rgba(var(--wd-brand-rgb), 0.5), transparent 68%);
}
.visual-glow {
  position: absolute;
  right: -140px;
  top: -120px;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--wd-accent-rgb), 0.22), transparent 66%);
  filter: blur(6px);
}
.visual-inner {
  position: relative;
  height: 100%;
  padding: var(--wd-s9) var(--wd-s9) var(--wd-s8);
  display: flex;
  flex-direction: column;
  color: #fff;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #fff;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.brand-text b {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.brand-text i {
  font-style: normal;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.62);
}

.visual-copy {
  margin-top: auto;
  max-width: 480px;
}
.visual-title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.28);
}
.visual-desc {
  margin-top: var(--wd-s4);
  font-size: 14px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.84);
}
.visual-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--wd-s6);
}
.visual-chips [chip] {
  padding: 7px 15px;
  border-radius: var(--wd-r-pill);
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.94);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  backdrop-filter: saturate(160%) blur(14px);
  transition: background 0.24s var(--wd-ease), transform 0.24s var(--wd-ease);
}
.visual-chips [chip]:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--wd-s7);
  align-self: flex-start;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.24s var(--wd-ease), gap 0.24s var(--wd-ease);
}
.back-home:hover {
  color: #fff;
  gap: 10px;
}

/* ---------------- 右：表单 ---------------- */
.auth-main {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* 向左压进实景一张圆角的距离，配合左侧大圆角：
     圆角后面透出实景，「实景 → 表单」不再是硬邦邦一条竖缝，
     而是像一张纸斜盖在照片上，两块自然衔接 */
  margin-left: calc(-1 * var(--wd-r-2xl));
  border-radius: var(--wd-r-2xl) 0 0 var(--wd-r-2xl);
  background: linear-gradient(180deg, #ffffff, var(--wd-bg) 46%);
  box-shadow: -18px 0 56px rgba(9, 21, 42, 0.22);
  /* 内边距保持左右等宽：面板整体（含压在照片上的那 36px）都是可见面，
     卡片居中的基准就是面板自身，多加左内边距反而会把卡片推偏 18px */
  padding: var(--wd-s8) var(--wd-gutter);
  overflow: hidden;
}
/* 极淡的同心圆装饰，避免右侧大面积空白发空 */
.auth-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.deco-ring {
  position: absolute;
  right: -180px;
  bottom: -180px;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  border: 1px solid rgba(var(--wd-brand-rgb), 0.1);
}
.deco-ring-2 {
  right: -110px;
  bottom: -110px;
  width: 300px;
  height: 300px;
  border-color: rgba(var(--wd-brand-rgb), 0.14);
}

.auth-card {
  position: relative;
  z-index: 1;
  background: var(--wd-glass-bg-strong);
  -webkit-backdrop-filter: var(--wd-glass-blur);
  backdrop-filter: var(--wd-glass-blur);
  border: 1px solid var(--wd-glass-border);
  width: 100%;
  max-width: 410px;
  padding: var(--wd-s8) var(--wd-s7) var(--wd-s7);
  border-radius: var(--wd-r-lg);
  box-shadow: var(--wd-sh-3);
}

.auth-head {
  margin-bottom: var(--wd-s6);
}
.auth-eyebrow {
  display: block;
  margin-bottom: 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--wd-brand-300);
}
.auth-title {
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.auth-sub {
  margin-top: 8px;
  font-size: 13px;
  color: var(--wd-text-3);
}

.auth-foot {
  margin-top: var(--wd-s3);
}

.auth-note {
  position: relative;
  z-index: 1;
  margin-top: var(--wd-s6);
  font-size: 12px;
  color: var(--wd-text-4);
}
.auth-note a {
  color: var(--wd-text-3);
  text-decoration: none;
  border-bottom: 1px solid var(--wd-border-strong);
  transition: color 0.2s var(--wd-ease), border-color 0.2s var(--wd-ease);
}
.auth-note a:hover {
  color: var(--wd-brand);
  border-color: var(--wd-brand-300);
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .auth-visual {
    min-height: 244px;
  }
  .visual-inner {
    padding: var(--wd-s6);
  }
  .visual-title {
    font-size: 25px;
  }
  .visual-desc,
  .visual-chips {
    display: none;
  }
  /* 单列时改为「向上盖住实景」：圆角挪到上缘，衔接逻辑与桌面端一致 */
  .auth-main {
    margin-left: 0;
    margin-top: calc(-1 * var(--wd-r-2xl));
    border-radius: var(--wd-r-2xl) var(--wd-r-2xl) 0 0;
    background: linear-gradient(180deg, #ffffff, var(--wd-bg) 30%);
    box-shadow: 0 -16px 44px rgba(9, 21, 42, 0.2);
    padding: var(--wd-s7) var(--wd-gutter) var(--wd-s9);
  }
}
</style>
