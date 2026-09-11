<template>
  <div class="wd-backbar">
    <button type="button" class="wd-backbtn" :title="`返回${backLabel}`" @click="goBack">
      <el-icon class="wd-backbtn-ico"><ArrowLeft /></el-icon>
      <span>返回{{ backLabel }}</span>
    </button>

    <nav class="wd-crumbs" aria-label="页面位置">
      <router-link to="/" class="wd-crumb">首页</router-link>
      <template v-for="p in parents" :key="p.label">
        <span class="wd-crumb-sep">/</span>
        <router-link :to="p.to" class="wd-crumb">{{ p.label }}</router-link>
      </template>
      <span class="wd-crumb-sep">/</span>
      <span class="wd-crumb is-current">{{ currentLabel }}</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    /** 末级面包屑文案，不传则按路由自动推断 */
    title?: string;
  }>(),
  { title: '' }
);

const route = useRoute();
const router = useRouter();

/**
 * 路由 → 上级层级（数组顺序即层级顺序）。
 * ⚠️ 通配规则必须排在具名规则之后，否则 `/community/topics` 会被
 * `/community/[^/]+` 抢先命中，面包屑变成「游记详情」。
 */
const TRAILS: Array<[RegExp, string[]]> = [
  [/^\/clothing\/[^/]+$/, ['非遗好物']],
  [/^\/food\/restaurant\/[^/]+$/, ['苗乡美食']],
  [/^\/hotel\/[^/]+$/, ['民宿住宿']],
  [/^\/travel\/routes\/[^/]+$/, ['景区出行', '精品路线']],
  [/^\/travel\/routes$/, ['景区出行']],
  [/^\/travel\/guides$/, ['景区出行']],
  [/^\/travel\/my-etickets$/, ['景区出行']],
  [/^\/community\/post\/[^/]+$/, ['社区分享']],
  [/^\/community\/topic\/[^/]+$/, ['社区分享', '话题广场']],
  [/^\/community\/user\/[^/]+$/, ['社区分享']],
  [/^\/community\/feed$/, ['社区分享']],
  [/^\/community\/topics$/, ['社区分享']],
  [/^\/community\/search$/, ['社区分享']],
  [/^\/community\/publish(-post)?$/, ['社区分享']],
  [/^\/community\/[^/]+$/, ['社区分享']], // 兜底：/community/:id 游记详情
  [/^\/pay\/[^/]+$/, ['购物车']],
  [/^\/user\/apply-merchant$/, ['个人中心']],
];

/** 末级面包屑文案：详情页拿不到数据标题，用「XX详情」代替裸的「详情」 */
const CURRENT_BY_PATH: Array<[RegExp, string]> = [
  [/^\/pay\/[^/]+$/, '收银台'],
  [/^\/clothing\/[^/]+$/, '好物详情'],
  [/^\/food\/restaurant\/[^/]+$/, '餐厅详情'],
  [/^\/hotel\/[^/]+$/, '民宿详情'],
  [/^\/travel\/routes\/[^/]+$/, '路线详情'],
  [/^\/community\/post\/[^/]+$/, '游记详情'],
  [/^\/community\/topic\/[^/]+$/, '话题详情'],
  [/^\/community\/user\/[^/]+$/, 'TA 的主页'],
  // 兜底只认纯数字 id，别把 topics / feed / search / publish 一起吃掉
  [/^\/community\/\d+$/, '游记详情'],
];

/** 层级名 → 落地路径 */
const LANDING: Record<string, string> = {
  非遗好物: '/clothing',
  苗乡美食: '/food',
  民宿住宿: '/hotel',
  景区出行: '/travel',
  精品路线: '/travel/routes',
  社区分享: '/community',
  话题广场: '/community/topics',
  购物车: '/cart',
  个人中心: '/user',
};

const parents = computed(() => {
  const hit = TRAILS.find(([re]) => re.test(route.path));
  if (!hit) return [];
  return hit[1]
    .map((label) => ({ label, to: LANDING[label] }))
    .filter((p) => !!p.to);
});

/** 末级文案：传入 title 优先，其次按路由推断，最后兜底「详情」 */
const currentLabel = computed(() => {
  if (props.title) return props.title;
  const byPath = CURRENT_BY_PATH.find(([re]) => re.test(route.path));
  if (byPath) return byPath[1];
  const last = route.path.split('/').filter(Boolean).pop() || '';
  const named: Record<string, string> = {
    cart: '购物车',
    orders: '我的订单',
    'my-etickets': '我的电子票',
    'apply-merchant': '商家入驻',
    search: '搜索',
    publish: '发布游记',
    'publish-post': '发布游记',
    feed: '关注动态',
    topics: '话题广场',
    routes: '精品路线',
    guides: '出行攻略',
    user: '个人中心',
  };
  return named[last] || (parents.value.length ? '详情' : '上一页');
});

const backLabel = computed(() => {
  const p = parents.value[parents.value.length - 1];
  return p ? p.label : '首页';
});

/**
 * 返回：有历史栈就真回退，直接打开链接（无历史）时退到上级页面。
 * 避免「点了返回却跳出站外 / 卡在原地」。
 */
function goBack() {
  const hasHistory = !!window.history.state?.back;
  if (hasHistory) {
    router.back();
    return;
  }
  const p = parents.value[parents.value.length - 1];
  router.push(p?.to || '/');
}
</script>

<style scoped>
.wd-backbar {
  display: flex;
  align-items: center;
  gap: var(--wd-s4);
  flex-wrap: wrap;
  margin-bottom: var(--wd-s5);
}

.wd-backbtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px 0 11px;
  border: 1px solid var(--wd-border-strong);
  border-radius: var(--wd-r-pill);
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: var(--wd-glass-blur);
  backdrop-filter: var(--wd-glass-blur);
  color: var(--wd-text-2);
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.22s var(--wd-ease), background 0.22s var(--wd-ease),
    border-color 0.22s var(--wd-ease), transform 0.22s var(--wd-ease),
    box-shadow 0.22s var(--wd-ease);
}
.wd-backbtn:hover {
  color: var(--wd-brand);
  border-color: var(--wd-brand-200);
  background: #fff;
  transform: translateX(-2px);
  box-shadow: var(--wd-sh-1);
}
.wd-backbtn:active {
  transform: translateX(-2px) scale(0.98);
}
.wd-backbtn:focus-visible {
  outline: 3px solid rgba(var(--wd-brand-rgb), 0.18);
  outline-offset: 2px;
}
.wd-backbtn-ico {
  font-size: 14px;
  transition: transform 0.22s var(--wd-ease);
}
.wd-backbtn:hover .wd-backbtn-ico {
  transform: translateX(-2px);
}

/* 面包屑：弱化存在感，只在需要定位时才看 */
.wd-crumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--wd-text-4);
  min-width: 0;
}
.wd-crumb {
  color: var(--wd-text-4);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.22s var(--wd-ease);
}
a.wd-crumb:hover {
  color: var(--wd-brand);
}
.wd-crumb.is-current {
  color: var(--wd-text-2);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}
.wd-crumb-sep {
  color: var(--wd-border-strong);
  user-select: none;
}

@media (max-width: 720px) {
  .wd-crumbs {
    display: none;
  }
}
</style>
