<template>
  <svg
    class="wd-avatar-art"
    viewBox="0 0 100 100"
    :width="size"
    :height="size"
    role="img"
    :aria-label="label"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath :id="clipId">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <linearGradient :id="bgId" x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0%" :stop-color="p.bgTop" />
        <stop offset="100%" :stop-color="p.bg" />
      </linearGradient>
    </defs>

    <g :clip-path="`url(#${clipId})`">
      <!-- 底色 -->
      <rect width="100" height="100" :fill="`url(#${bgId})`" />

      <!-- 背景：远山 + 日头，与 EmptyState 同一套线稿语言 ================ -->
      <path
        d="M-6 97 L20 71 Q24 67 28 71 L42 85 L56 69 Q60 65 64 69 L106 97 Z"
        :fill="p.bgHill"
        opacity="0.5"
      />
      <circle cx="77" cy="23" r="12.5" :fill="p.bgSun" opacity="0.45" />

      <!-- 头发（露在头与肩之外的轮廓） ================================ -->
      <ellipse cx="50" cy="44" rx="21.5" ry="23" :fill="h.deep" />

      <!-- 躯干与衣襟 ================================================== -->
      <path d="M14 100 C14 81 29 73 50 73 C71 73 86 81 86 100 Z" :fill="p.cloth" />
      <path d="M50 73 L59 100 L41 100 Z" fill="#ffffff" opacity="0.15" />
      <g :fill="p.accent" opacity="0.92">
        <path d="M19 94 L26 94 L22.5 87 Z" />
        <path d="M81 94 L74 94 L77.5 87 Z" />
      </g>

      <!-- 脖子 -->
      <rect x="44" y="60" width="12" height="17" rx="5.6" :fill="s.shade" />

      <!-- 银项圈（苗族标志性配饰） ==================================== -->
      <g fill="none" stroke-linecap="round">
        <path d="M33.5 75 Q50 87.5 66.5 75" :stroke="silver" stroke-width="3.3" />
        <path d="M37 80.5 Q50 91 63 80.5" :stroke="silverDark" stroke-width="2.2" />
      </g>

      <!-- 耳朵 -->
      <circle cx="30" cy="49.5" r="4.8" :fill="s.skin" />
      <circle cx="70" cy="49.5" r="4.8" :fill="s.skin" />

      <!-- 脸 -->
      <ellipse cx="50" cy="48" rx="19.4" ry="20.4" :fill="s.skin" />

      <!-- 刘海 -->
      <path
        d="M30 45.5 Q30 21 50 21 Q70 21 70 45.5 Q70 33 50 33 Q30 33 30 45.5 Z"
        :fill="h.hair"
      />

      <!-- 五官 ======================================================== -->
      <g fill="none" :stroke="h.deep" stroke-width="1.5" stroke-linecap="round" opacity="0.9">
        <path d="M37 41.6 Q41 39.6 45 41.6" />
        <path d="M55 41.6 Q59 39.6 63 41.6" />
      </g>

      <!-- 眼睛：0 圆眼 / 1 弯眼笑 / 2 细眼 -->
      <template v-if="eyes === 1">
        <g fill="none" :stroke="h.deep" stroke-width="2.3" stroke-linecap="round">
          <path d="M37.6 49.6 Q41 45.2 44.4 49.6" />
          <path d="M55.6 49.6 Q59 45.2 62.4 49.6" />
        </g>
      </template>
      <template v-else>
        <g :fill="h.deep">
          <ellipse cx="41" cy="48.6" :rx="eyes === 2 ? 3.2 : 2.9" :ry="eyes === 2 ? 2.2 : 3.5" />
          <ellipse cx="59" cy="48.6" :rx="eyes === 2 ? 3.2 : 2.9" :ry="eyes === 2 ? 2.2 : 3.5" />
        </g>
        <g v-if="eyes === 0" fill="#ffffff" opacity="0.92">
          <circle cx="42.1" cy="47.3" r="1.05" />
          <circle cx="60.1" cy="47.3" r="1.05" />
        </g>
      </template>

      <!-- 腮红 -->
      <g v-if="blush" fill="#e8735f" opacity="0.28">
        <ellipse cx="34.6" cy="54.6" rx="4.2" ry="2.6" />
        <ellipse cx="65.4" cy="54.6" rx="4.2" ry="2.6" />
      </g>

      <!-- 鼻 -->
      <path
        d="M50 51.6 Q51.9 53.9 50 54.6"
        fill="none"
        :stroke="s.shade"
        stroke-width="1.4"
        stroke-linecap="round"
      />

      <!-- 嘴：0 微笑 / 1 张口笑 / 2 小嘴 -->
      <path
        v-if="mouth === 0"
        d="M45.6 57.5 Q50 61.8 54.4 57.5"
        fill="none"
        stroke="#b0492f"
        stroke-width="2.1"
        stroke-linecap="round"
      />
      <template v-else-if="mouth === 1">
        <path d="M45.6 57.4 Q50 63.6 54.4 57.4 Z" fill="#b0492f" />
        <path d="M47.6 58.8 Q50 61.2 52.4 58.8 Z" fill="#e3746a" />
      </template>
      <path
        v-else
        d="M47.6 58.2 Q50 60.3 52.4 58.2"
        fill="none"
        stroke="#b0492f"
        stroke-width="1.9"
        stroke-linecap="round"
      />

      <!-- 头饰 ======================================================== -->
      <!-- 0 银角银冠 -->
      <g v-if="hat === 0">
        <path d="M36 27 C23 24.5 13 15 14.5 2.5 C21 13.5 28.5 20 38.5 23.2 Z" :fill="silver" />
        <path d="M64 27 C77 24.5 87 15 85.5 2.5 C79 13.5 71.5 20 61.5 23.2 Z" :fill="silver" />
        <rect x="30.5" y="25.5" width="39" height="7" rx="3.5" :fill="silver" />
        <rect x="30.5" y="27.2" width="39" height="1.7" fill="#ffffff" opacity="0.72" />
        <circle cx="50" cy="29" r="1.5" :fill="p.accent" />
        <circle cx="40.4" cy="29" r="1.15" :fill="p.accent" opacity="0.85" />
        <circle cx="59.6" cy="29" r="1.15" :fill="p.accent" opacity="0.85" />
      </g>

      <!-- 1 靛蓝头帕 -->
      <g v-else-if="hat === 1">
        <path
          d="M29.5 33 Q27.5 15.5 50 15.5 Q72.5 15.5 70.5 33 Q66 26.5 50 26.5 Q34 26.5 29.5 33 Z"
          :fill="p.cloth"
        />
        <path d="M70 22.5 q9 -5.2 10 3.6 q-7.2 2.6 -10 -3.6 Z" :fill="p.clothDeep" />
        <rect x="62" y="18.6" width="12" height="2.1" rx="1.05" :fill="silver" />
      </g>

      <!-- 2 花环 -->
      <g v-else-if="hat === 2">
        <g v-for="(f, i) in flowerPos" :key="i">
          <circle
            v-for="(o, j) in petalOffsets"
            :key="j"
            :cx="f[0] + o[0]"
            :cy="f[1] + o[1]"
            r="2.25"
            :fill="i % 2 ? '#ffffff' : p.accent"
            opacity="0.95"
          />
          <circle :cx="f[0]" :cy="f[1]" r="1.55" :fill="silver" />
        </g>
      </g>

      <!-- 3 双髻 -->
      <g v-else>
        <g :fill="h.hair">
          <circle cx="29.5" cy="25" r="7.7" />
          <circle cx="70.5" cy="25" r="7.7" />
        </g>
        <g fill="none" :stroke="h.deep" stroke-width="1.1" opacity="0.45">
          <circle cx="29.5" cy="25" r="7.7" />
          <circle cx="70.5" cy="25" r="7.7" />
        </g>
        <g :fill="silver">
          <circle cx="29.5" cy="30.4" r="1.6" />
          <circle cx="70.5" cy="30.4" r="1.6" />
        </g>
      </g>
    </g>

    <!-- 压在外层，用于叠在封面图上时和背景拉开 ============================ -->
    <circle v-if="ring" cx="50" cy="50" r="48.4" fill="none" stroke="#ffffff" stroke-width="3" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 决定长相的种子：用用户 id 或昵称，保证同一个人每次都是同一张脸 */
    seed?: string | number;
    /** 尺寸（px） */
    size?: number | string;
    /** 加一圈白描边，用于压在封面图 / 深色底上 */
    ring?: boolean;
    label?: string;
  }>(),
  {
    seed: '',
    size: 40,
    ring: false,
    label: '用户头像',
  }
);

/* --------------------------------------------------------------------------
   配色：与全站靛蓝体系同源，苗族服饰色作变化
   -------------------------------------------------------------------------- */
const PALETTES = [
  { bgTop: '#2a5289', bg: '#1b3a68', bgHill: '#3f68a3', bgSun: '#9dc0ea', cloth: '#2f5da0', clothDeep: '#1f4680', accent: '#b93226' },
  { bgTop: '#c2493a', bg: '#9d2f24', bgHill: '#d96a58', bgSun: '#f3b7a8', cloth: '#c9473a', clothDeep: '#a33429', accent: '#22467e' },
  { bgTop: '#2b8a83', bg: '#1c615c', bgHill: '#48a49c', bgSun: '#bfe6e0', cloth: '#2b8a83', clothDeep: '#1d6660', accent: '#d9a441' },
  { bgTop: '#c8913c', bg: '#9a6b21', bgHill: '#dcab5c', bgSun: '#f6dfae', cloth: '#c8913c', clothDeep: '#a3732a', accent: '#22467e' },
  { bgTop: '#5d4cab', bg: '#40327f', bgHill: '#7a69c6', bgSun: '#c9bff0', cloth: '#5d4cab', clothDeep: '#443788', accent: '#d9a441' },
  { bgTop: '#3c8a51', bg: '#276136', bgHill: '#57a86c', bgSun: '#c4e6cd', cloth: '#3c8a51', clothDeep: '#2b6739', accent: '#b93226' },
];

const SKINS = [
  { skin: '#f7d9c0', shade: '#e6bd9d' },
  { skin: '#f0c6a3', shade: '#dcab84' },
  { skin: '#e0aa80', shade: '#c98f66' },
  { skin: '#c98b62', shade: '#ac6f4a' },
];

const HAIRS = [
  { hair: '#2f2b33', deep: '#1f1c22' },
  { hair: '#3f2a1e', deep: '#2b1c13' },
  { hair: '#4d3a26', deep: '#352717' },
  { hair: '#26292f', deep: '#171a1f' },
];

const silver = '#dbe2ec';
const silverDark = '#aeb9c8';

const flowerPos: Array<[number, number]> = [
  [31.5, 32],
  [39, 24.5],
  [50, 21.5],
  [61, 24.5],
  [68.5, 32],
];
const petalOffsets: Array<[number, number]> = [
  [2.5, 0],
  [-2.5, 0],
  [0, 2.5],
  [0, -2.5],
];

/* --------------------------------------------------------------------------
   由 seed 派生：FNV-1a 哈希后按不同位段取，保证各个特征相互独立
   -------------------------------------------------------------------------- */
const hash = computed(() => {
  const str = String(props.seed || 'wudong');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
});

const pick = <T,>(arr: T[], shift: number) => arr[(hash.value >>> shift) % arr.length];

const p = computed(() => pick(PALETTES, 0));
const s = computed(() => pick(SKINS, 5));
const h = computed(() => pick(HAIRS, 9));
const hat = computed(() => (hash.value >>> 12) % 4);
const eyes = computed(() => (hash.value >>> 15) % 3);
const mouth = computed(() => (hash.value >>> 18) % 3);
const blush = computed(() => ((hash.value >>> 21) & 1) === 0);

/** 同页可能有很多个头像，渐变与裁剪 id 必须各自唯一 */
const uid = Math.random().toString(36).slice(2, 9);
const clipId = `wdAvaClip-${uid}`;
const bgId = `wdAvaBg-${uid}`;
</script>

<style scoped>
.wd-avatar-art {
  display: block;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--wd-silver-soft, #eef1f6);
}
</style>
