<template>
  <div>
    <el-card>
      <el-tabs v-model="tab" @tab-change="reload">
        <!-- 商品 -->
        <el-tab-pane label="商品管理" name="products">
          <div class="toolbar">
            <el-input v-model="keyword" placeholder="搜索商品名" class="search" clearable @keyup.enter="loadProducts(1)" />
            <el-select v-model="status" placeholder="全部状态" clearable class="select" @change="loadProducts(1)">
              <el-option label="上架中" value="1" />
              <el-option label="已下架" value="0" />
            </el-select>
            <el-button type="primary" @click="loadProducts(1)">查询</el-button>
            <el-button type="success" @click="openProduct()">新增商品</el-button>
          </div>
          <el-table :data="products" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="title" label="商品名" />
            <el-table-column label="售价" width="100">
              <template #default="{ row }"><span class="money">¥{{ row.price }}</span></template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="sales" label="销量" width="80" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="dark">{{ row.status === 1 ? '上架中' : '已下架' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="openProduct(row)">编辑</el-button>
                <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleProduct(row)">{{ row.status === 1 ? '下架' : '上架' }}</el-button>
                <el-button link type="danger" @click="deleteProduct(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            layout="prev, pager, next, total"
            :total="total"
            :page-size="10"
            :current-page="page"
            class="pager"
            @current-change="loadProducts"
          />
        </el-tab-pane>

        <!-- 库存预警 -->
        <el-tab-pane label="库存预警" name="warnings">
          <el-table :data="warnings" stripe>
            <el-table-column prop="productTitle" label="商品" />
            <el-table-column prop="specName" label="规格" width="160" />
            <el-table-column prop="stock" label="当前库存" width="100" />
            <el-table-column label="操作" width="130">
              <template #default="{ row }">
                <el-button link type="primary" @click="adjustStock(row)">调整库存</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!warnings.length" description="暂无库存预警（低于 10 件）" />
        </el-tab-pane>

        <!-- 订单 -->
        <el-tab-pane label="订单管理" name="orders">
          <div class="toolbar">
            <el-select v-model="orderStatus" placeholder="全部状态" clearable class="select" @change="loadOrders(1)">
              <el-option v-for="(t, s) in statusTexts" :key="s" :label="t" :value="Number(s)" />
            </el-select>
            <el-button type="primary" @click="loadOrders(1)">查询</el-button>
          </div>
          <el-table :data="orders" stripe>
            <el-table-column prop="orderNo" label="订单号" width="170" />
            <el-table-column prop="remark" label="内容" />
            <el-table-column label="金额" width="100">
              <template #default="{ row }"><span class="money">¥{{ row.totalAmount }}</span></template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag size="small" effect="dark">{{ statusTexts[row.status] || `状态${row.status}` }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="下单时间" width="160">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="90">
              <template #default="{ row }">
                <el-button link type="primary" @click="openOrder(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            layout="prev, pager, next, total"
            :total="orderTotal"
            :page-size="10"
            :current-page="orderPage"
            class="pager"
            @current-change="loadOrders"
          />
        </el-tab-pane>

        <!-- 评价 -->
        <el-tab-pane label="评价管理" name="reviews">
          <el-table :data="reviews" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column label="评分" width="80">
              <template #default="{ row }">{{ row.rating }} 星</template>
            </el-table-column>
            <el-table-column prop="content" label="评价内容" />
            <el-table-column prop="merchantReply" label="商家回复" width="180" show-overflow-tooltip />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.isHidden ? 'danger' : 'success'" size="small" effect="dark">{{ row.isHidden ? '已隐藏' : '正常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="170">
              <template #default="{ row }">
                <el-button link type="primary" @click="replyReview(row)">回复</el-button>
                <el-button link :type="row.isHidden ? 'success' : 'danger'" @click="hideReview(row)">{{ row.isHidden ? '恢复显示' : '隐藏' }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            layout="prev, pager, next, total"
            :total="reviewTotal"
            :page-size="10"
            :current-page="reviewPage"
            class="pager"
            @current-change="loadReviews"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 商品编辑弹窗 -->
    <el-dialog v-model="productDialog" :title="form.id ? '编辑商品' : '新增商品'" width="640px" top="5vh">
      <el-form label-width="90px">
        <el-form-item label="商品名"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="form.subtitle" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="主图URL"><el-input v-model="form.mainImage" placeholder="http://..." /></el-form-item>
        <el-form-item label="市场价"><el-input-number v-model="form.marketPrice" :min="0" :precision="2" controls-position="right" /></el-form-item>
        <el-form-item label="运费"><el-input-number v-model="form.freight" :min="0" :precision="2" controls-position="right" /></el-form-item>
        <el-form-item label="工艺介绍"><el-input v-model="form.craftIntro" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="详情"><el-input v-model="form.detail" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="SKU 规格">
          <div class="sku-box">
            <div v-for="(sku, i) in form.skus" :key="i" class="sku-row">
              <el-input v-model="sku.specName" placeholder="规格名" class="sku-name" />
              <el-input-number v-model="sku.price" :min="0" :precision="2" :controls="false" placeholder="价格" class="sku-num" />
              <el-input-number v-model="sku.stock" :min="0" :controls="false" placeholder="库存" class="sku-num" />
              <el-button link type="danger" @click="form.skus.splice(i, 1)">删除</el-button>
            </div>
            <el-button size="small" @click="form.skus.push({ specName: '', price: 0, stock: 0 })">添加规格</el-button>
          </div>
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="imagesStr" type="textarea" :rows="2" placeholder="多个图片 URL 用英文逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">保存</el-button>
      </template>
    </el-dialog>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="orderDialog" title="订单详情" width="560px">
      <div v-if="orderDetail">
        <p><b>订单号：</b>{{ orderDetail.orderNo }}</p>
        <p><b>状态：</b>{{ statusTexts[orderDetail.status] || orderDetail.status }}</p>
        <p><b>金额：</b>{{ orderDetail.totalAmount }} 元</p>
        <p><b>下单时间：</b>{{ formatTime(orderDetail.createdAt) }}</p>
        <el-table :data="orderDetail.items" border size="small" class="items">
          <el-table-column prop="title" label="商品" />
          <el-table-column prop="specName" label="规格" width="130" />
          <el-table-column label="单价" width="90">
            <template #default="{ row }"><span class="money">¥{{ row.price }}</span></template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="70" />
        </el-table>
        <p v-if="orderDetail.refund" class="refund">
          <b>退款单：</b>{{ orderDetail.refund.refundNo }}（{{ orderDetail.refund.status === 0 ? '待审核' : orderDetail.refund.status === 1 ? '已通过' : '已驳回' }}）
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../api/request';

const tab = ref('products');

// 商品
const keyword = ref('');
const status = ref('');
const products = ref<any[]>([]);
const total = ref(0);
const page = ref(1);

// 库存预警
const warnings = ref<any[]>([]);

// 订单
const orderStatus = ref('');
const orders = ref<any[]>([]);
const orderTotal = ref(0);
const orderPage = ref(1);
const orderDialog = ref(false);
const orderDetail = ref<any>(null);

// 评价
const reviews = ref<any[]>([]);
const reviewTotal = ref(0);
const reviewPage = ref(1);

// 商品编辑
const productDialog = ref(false);
const categories = ref<any[]>([]);
const form = reactive<any>({ skus: [] });
const imagesStr = ref('');

const statusTexts: Record<number, string> = {
  0: '待支付', 1: '已支付', 2: '已确认', 3: '进行中', 4: '已完成', 5: '已取消', 6: '退款中', 7: '已退款',
};

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

async function loadProducts(p = 1) {
  page.value = p;
  try {
    const data: any = await request.get('/merchant/clothing/products', {
      params: { keyword: keyword.value || undefined, status: status.value || undefined, page: page.value, pageSize: 10 },
    });
    products.value = data.list || [];
    total.value = data.total || 0;
  } catch {
    // 已提示
  }
}

async function loadCategories() {
  try {
    categories.value = await request.get('/clothing/categories');
  } catch {
    // 已提示
  }
}

async function openProduct(row?: any) {
  form.id = row?.id;
  form.title = row?.title || '';
  form.subtitle = row?.subtitle || '';
  form.categoryId = row?.categoryId;
  form.mainImage = row?.mainImage || '';
  form.marketPrice = Number(row?.marketPrice || 0);
  form.freight = Number(row?.freight || 0);
  form.craftIntro = row?.craftIntro || '';
  form.detail = row?.detail || '';
  form.skus = [];
  imagesStr.value = '';
  if (row?.id) {
    try {
      const detail: any = await request.get(`/merchant/clothing/products/${row.id}`);
      form.skus = (detail.skus || []).map((s: any) => ({ specName: s.specName, price: Number(s.price), stock: s.stock }));
      imagesStr.value = (detail.images || []).join(',');
    } catch {
      // 已提示
    }
  }
  productDialog.value = true;
}

async function saveProduct() {
  if (!form.title || !form.categoryId) {
    ElMessage.warning('请填写商品名并选择分类');
    return;
  }
  const skus = (form.skus || []).filter((s: any) => s.specName);
  try {
    await request.post('/merchant/clothing/products/save', {
      ...form,
      skus: skus.length ? skus : undefined,
      images: imagesStr.value ? imagesStr.value.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    });
    ElMessage.success('已保存');
    productDialog.value = false;
    loadProducts(page.value);
  } catch {
    // 已提示
  }
}

async function toggleProduct(row: any) {
  try {
    await request.post(`/merchant/clothing/products/${row.id}/toggle`);
    ElMessage.success('已切换');
    loadProducts(page.value);
  } catch {
    // 已提示
  }
}

async function deleteProduct(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除商品「${row.title}」？`, '提示', { type: 'warning' });
    await request.post(`/merchant/clothing/products/${row.id}/delete`);
    ElMessage.success('已删除');
    loadProducts(page.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

async function loadWarnings() {
  try {
    warnings.value = await request.get('/merchant/clothing/stock-warnings');
  } catch {
    // 已提示
  }
}

async function adjustStock(row: any) {
  try {
    const { value } = await ElMessageBox.prompt(`「${row.productTitle} - ${row.specName}」当前库存 ${row.stock}，请输入新库存`, '调整库存', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入非负整数',
    });
    await request.post(`/merchant/clothing/skus/${row.id}/stock`, { stock: Number(value) });
    ElMessage.success('已调整');
    loadWarnings();
  } catch (e: any) {
    // 取消或已提示
  }
}

async function loadOrders(p = 1) {
  orderPage.value = p;
  try {
    const data: any = await request.get('/merchant/clothing/orders', {
      params: { status: orderStatus.value || undefined, page: orderPage.value, pageSize: 10 },
    });
    orders.value = data.list || [];
    orderTotal.value = data.total || 0;
  } catch {
    // 已提示
  }
}

async function openOrder(row: any) {
  try {
    orderDetail.value = await request.get(`/merchant/clothing/orders/${row.id}`);
    orderDialog.value = true;
  } catch {
    // 已提示
  }
}

async function loadReviews(p = 1) {
  reviewPage.value = p;
  try {
    const data: any = await request.get('/merchant/clothing/reviews', {
      params: { page: reviewPage.value, pageSize: 10 },
    });
    reviews.value = data.list || [];
    reviewTotal.value = data.total || 0;
  } catch {
    // 已提示
  }
}

async function replyReview(row: any) {
  try {
    const { value } = await ElMessageBox.prompt('请输入回复内容', '回复评价', {
      inputValue: row.merchantReply || '',
    });
    await request.post(`/merchant/clothing/reviews/${row.id}/reply`, { reply: value || '' });
    ElMessage.success('已回复');
    loadReviews(reviewPage.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

async function hideReview(row: any) {
  try {
    await request.post(`/merchant/clothing/reviews/${row.id}/hide`, { hidden: !row.isHidden });
    ElMessage.success('已操作');
    loadReviews(reviewPage.value);
  } catch {
    // 已提示
  }
}

function reload() {
  if (tab.value === 'products') loadProducts(1);
  if (tab.value === 'warnings') loadWarnings();
  if (tab.value === 'orders') loadOrders(1);
  if (tab.value === 'reviews') loadReviews(1);
}

onMounted(() => {
  loadProducts(1);
  loadCategories();
  loadWarnings();
  loadOrders(1);
  loadReviews(1);
});
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-light);
}
.search {
  width: 200px;
}
.select {
  width: 130px;
}
.pager {
  margin-top: 18px;
  justify-content: flex-end;
}
.sku-box {
  width: 100%;
}
.sku-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.sku-name {
  width: 180px;
}
.sku-num {
  width: 120px;
}
.items {
  margin-top: 8px;
}
.refund {
  margin-top: 10px;
}
</style>
