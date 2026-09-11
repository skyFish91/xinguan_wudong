<template>
  <div>
    <TopNav />
    <div class="wd-container wd-page">
      <!-- 页头 -->
      <header class="page-head">
        <h1 class="page-title">非遗好物</h1>
        <p class="page-sub">苗绣 · 银饰 · 蜡染 · 手工织锦，每一件都由苗乡匠人手工制成</p>
      </header>

      <!-- 筛选栏（液态玻璃吸顶） -->
      <div class="toolbar glass-strong">
        <el-input
          v-model="keyword"
          placeholder="搜索非遗好物"
          class="search"
          clearable
          :prefix-icon="Search"
          @keyup.enter="load(1)"
        />
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-radio-group v-model="sort" class="sorts" @change="load(1)">
          <el-radio-button value="default">综合</el-radio-button>
          <el-radio-button value="sales">销量</el-radio-button>
          <el-radio-button value="price_asc">价格↑</el-radio-button>
          <el-radio-button value="price_desc">价格↓</el-radio-button>
        </el-radio-group>
      </div>

      <div class="body">
        <!-- 分类 -->
        <aside class="side">
          <div class="side-title">全部分类</div>
          <div
            v-for="c in categories"
            :key="c.id"
            class="cat"
            :class="{ active: topCatId === c.id }"
            @click="onTopCat(c)"
          >
            <span>{{ c.name }}</span>
            <el-icon v-if="topCatId === c.id"><ArrowRight /></el-icon>
          </div>
        </aside>

        <!-- 商品 -->
        <main class="main">
          <div v-if="subCats.length" class="sub-cats">
            <span
              v-for="s in subCats"
              :key="s.id"
              class="sub-pill"
              :class="{ active: categoryId === s.id }"
              @click="onSubCat(s)"
            >
              {{ s.name }}
            </span>
          </div>

          <!-- 结果统计 -->
          <div v-if="!loading && list.length" class="result-bar">
            共 <b>{{ total }}</b> 件好物
          </div>

          <!-- 骨架屏 -->
          <div v-if="loading" class="wd-grid goods-grid">
            <SkeletonCard v-for="i in 8" :key="`s${i}`" cover="200px" />
          </div>

          <!-- 商品栅格 -->
          <div v-else-if="list.length" class="wd-grid goods-grid">
            <article
              v-for="(p, i) in list"
              :key="p.id"
              class="wd-card wd-card-hover wd-rise"
              :style="{ animationDelay: `${Math.min(i, 8) * 50}ms` }"
              @click="$router.push(`/clothing/${p.id}`)"
            >
              <div class="wd-media" style="height: 200px">
                <img :src="img(p.mainImage, p.title, true)" :alt="p.title" @error="imgError" />
                <span v-if="p.sales" class="wd-chip card-chip">已售 {{ p.sales }}</span>
              </div>
              <div class="wd-card-body">
                <div class="wd-title clamp-1">{{ p.title }}</div>
                <div class="wd-desc clamp-1">{{ p.subtitle || '苗乡手作 · 匠心出品' }}</div>
                <div class="card-foot">
                  <span class="wd-price">¥{{ p.price }}</span>
                  <span class="buy-hint">
                    查看 <el-icon><ArrowRight /></el-icon>
                  </span>
                </div>
              </div>
            </article>
          </div>

          <!-- 空状态 -->
          <div v-else class="wd-card">
            <EmptyState
              variant="search"
              :title="keyword ? '没有找到相关好物' : '该分类下暂无商品'"
              :desc="keyword ? `换个关键词试试，或者看看其他分类的手作好物。` : '我们正在陆续上架更多苗乡匠人作品，敬请期待。'"
            >
              <el-button v-if="keyword" @click="resetKeyword">清空搜索</el-button>
              <router-link v-else to="/community"><el-button type="primary">去社区逛逛</el-button></router-link>
            </EmptyState>
          </div>

          <el-pagination
            v-if="total > pageSize"
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            class="pager"
            @current-change="load"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ArrowRight, Search } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import SkeletonCard from '../../components/SkeletonCard.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { img, imgError } from '../../utils/media';

const categories = ref<any[]>([]);
const topCatId = ref<number>(0);
const subCats = ref<any[]>([]);
const categoryId = ref<number | undefined>(undefined);
const keyword = ref('');
const sort = ref('default');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

function resetKeyword() {
  keyword.value = '';
  load(1);
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/clothing/products', {
      params: {
        categoryId: categoryId.value,
        keyword: keyword.value || undefined,
        sort: sort.value,
        page: page.value,
        pageSize,
      },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

function onTopCat(c: any) {
  topCatId.value = c.id;
  subCats.value = c.children || [];
  categoryId.value = undefined;
  load(1);
}

function onSubCat(s: any) {
  categoryId.value = categoryId.value === s.id ? undefined : s.id;
  load(1);
}

onMounted(async () => {
  try {
    categories.value = await request.get('/clothing/categories');
  } catch {
    // 已提示
  }
  load(1);
});
</script>

<style scoped>
/* 页头 */
.page-head {
  margin-bottom: var(--wd-s6);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

/* 筛选栏 */
.toolbar {
  position: sticky;
  top: 80px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: var(--wd-s7);
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.search {
  width: 280px;
}
.sorts {
  margin-left: auto;
}

/* 主体 */
.body {
  display: flex;
  gap: var(--wd-s7);
  align-items: flex-start;
}

/* 侧栏分类 */
.side {
  width: 168px;
  flex-shrink: 0;
  position: sticky;
  top: 156px;
}
.side-title {
  padding: 0 12px 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--wd-text-4);
  text-transform: uppercase;
}
.cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 10px 14px;
  margin-bottom: 4px;
  border-radius: var(--wd-r-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--wd-text-2);
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.cat:hover {
  background: #fff;
  color: var(--wd-brand);
  box-shadow: var(--wd-sh-1);
}
.cat.active {
  color: #fff;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 8px 20px rgba(var(--wd-brand-rgb), 0.24);
}
.cat .el-icon {
  font-size: 12px;
}

.main {
  flex: 1;
  min-width: 0;
}

/* 子分类胶囊 */
.sub-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--wd-s5);
}
.sub-pill {
  padding: 7px 16px;
  border-radius: var(--wd-r-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--wd-text-2);
  background: #fff;
  border: 1px solid var(--wd-border);
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.sub-pill:hover {
  color: var(--wd-brand);
  border-color: rgba(var(--wd-brand-rgb), 0.3);
}
.sub-pill.active {
  color: #fff;
  background: var(--wd-brand);
  border-color: var(--wd-brand);
  box-shadow: 0 6px 16px rgba(var(--wd-brand-rgb), 0.22);
}

.result-bar {
  margin-bottom: var(--wd-s4);
  font-size: 13px;
  color: var(--wd-text-4);
}
.result-bar b {
  color: var(--wd-text-1);
  font-size: 15px;
}

/* 商品栅格：侧栏占位后自适应列数 */
.goods-grid {
  grid-template-columns: repeat(auto-fill, minmax(212px, 1fr));
  gap: var(--wd-s5);
}

.card-chip {
  position: absolute;
  left: 12px;
  top: 12px;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.buy-hint {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wd-text-4);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.3s var(--wd-ease);
}
.wd-card:hover .buy-hint {
  opacity: 1;
  transform: none;
  color: var(--wd-brand);
}

.pager {
  margin-top: var(--wd-s8);
  justify-content: center;
}

@media (max-width: 900px) {
  .side {
    display: none;
  }
  .toolbar {
    flex-wrap: wrap;
    border-radius: var(--wd-r-lg);
  }
  .search {
    width: 100%;
  }
  .sorts {
    margin-left: 0;
  }
}
</style>
