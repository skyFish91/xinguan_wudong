<template>
  <div>
    <TopNav />
    <div class="page">
      <h2 class="page-title">{{ isAdmin ? '食模块 · 平台管理' : '食模块 · 商家后台' }}</h2>

      <el-tabs v-model="tab" @tab-change="reload">
        <!-- 数据统计 -->
        <el-tab-pane label="数据统计" name="stats">
          <div class="stat-cards">
            <div class="stat-card" v-if="isAdmin">
              <div class="num">{{ stats.restaurantCount ?? 0 }}</div>
              <div class="label">餐厅数</div>
            </div>
            <div class="stat-card" v-if="!isAdmin">
              <div class="num">{{ stats.orderCount ?? 0 }}</div>
              <div class="label">订单数</div>
            </div>
            <div class="stat-card">
              <div class="num">{{ stats.mealBookingCount ?? 0 }}</div>
              <div class="label">预订量</div>
            </div>
            <div class="stat-card">
              <div class="num">{{ stats.farmProductCount ?? 0 }}</div>
              <div class="label">农产品数</div>
            </div>
            <div class="stat-card">
              <div class="num">{{ stats.farmSales ?? 0 }}</div>
              <div class="label">农产品销量</div>
            </div>
            <div class="stat-card">
              <div class="num">¥{{ isAdmin ? (stats.totalSales ?? 0) : (stats.orderAmount ?? 0) }}</div>
              <div class="label">{{ isAdmin ? '平台总销售额' : '本店销售额' }}</div>
            </div>
            <div class="stat-card" v-if="isAdmin">
              <div class="num">{{ stats.reviewCount ?? 0 }}</div>
              <div class="label">评价数</div>
            </div>
          </div>
          <el-divider content-position="left">TOP 招牌菜</el-divider>
          <el-table :data="stats.topDishes || []" stripe>
            <el-table-column label="图片" width="90">
              <template #default="{ row }">
                <img :src="row.mainImage" class="dish-thumb" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="菜名" width="170" />
            <el-table-column prop="restaurantName" label="所属餐厅" width="170" />
            <el-table-column label="价格" width="100">
              <template #default="{ row }"><span class="money">¥{{ row.price }}</span></template>
            </el-table-column>
            <el-table-column label="招牌" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.isSignature" type="warning" size="small" effect="dark">招牌</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="intro" label="介绍" />
          </el-table>

          <!-- 各店铺销售情况（仅管理员） -->
          <template v-if="isAdmin">
            <el-divider content-position="left">各店铺销售情况</el-divider>
            <el-table :data="stats.merchantSales || []" stripe>
              <el-table-column prop="name" label="店铺" />
              <el-table-column prop="orderCount" label="订单数" width="120" />
              <el-table-column label="销售额" width="160">
                <template #default="{ row }"><span class="money">¥{{ row.amount }}</span></template>
              </el-table-column>
            </el-table>
          </template>
        </el-tab-pane>

        <!-- 商家专属 -->
        <!-- 商家专属 -->
        <!-- 餐厅信息 -->
        <el-tab-pane v-if="!isAdmin" label="餐厅信息" name="restaurant">
            <el-form label-width="100px" class="rest-form">
              <el-form-item label="餐厅名称"><el-input v-model="restForm.name" /></el-form-item>
              <el-form-item label="地址"><el-input v-model="restForm.address" /></el-form-item>
              <el-form-item label="经度"><el-input v-model="restForm.longitude" placeholder="如 108.123456" /></el-form-item>
              <el-form-item label="纬度"><el-input v-model="restForm.latitude" placeholder="如 26.456789" /></el-form-item>
              <el-form-item label="营业时间"><el-input v-model="restForm.openTime" placeholder="如 11:00-21:00" /></el-form-item>
              <el-form-item label="餐位容量"><el-input-number v-model="restForm.capacity" :min="1" controls-position="right" /></el-form-item>
              <el-form-item label="人均价格"><el-input-number v-model="restForm.avgPrice" :min="0" :precision="2" controls-position="right" /></el-form-item>
              <el-form-item label="主图URL"><el-input v-model="restForm.mainImage" placeholder="/uploads/seeds/restaurant-1.jpg" /></el-form-item>
              <el-form-item label="餐厅介绍"><el-input v-model="restForm.intro" type="textarea" :rows="4" /></el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveRestaurant">保存餐厅信息</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 菜品管理 -->
          <el-tab-pane v-if="!isAdmin" label="菜品管理" name="dishes">
            <div class="toolbar">
              <el-button type="success" @click="openDish()">新增菜品</el-button>
            </div>
            <el-table :data="dishes" stripe>
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="name" label="菜名" width="180" />
              <el-table-column label="价格" width="90">
                <template #default="{ row }"><span class="money">¥{{ row.price }}</span></template>
              </el-table-column>
              <el-table-column prop="intro" label="介绍" />
              <el-table-column label="招牌" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.isSignature" type="warning" size="small" effect="dark">招牌</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="dark">{{ row.status === 1 ? '上架中' : '已下架' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openDish(row)">编辑</el-button>
                  <el-button link type="danger" @click="deleteDish(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 时段管理 -->
          <el-tab-pane v-if="!isAdmin" label="时段管理" name="slots">
            <div class="toolbar">
              <el-button type="success" @click="openSlot()">新增时段</el-button>
            </div>
            <el-table :data="slots" stripe>
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="slotName" label="时段" width="220" />
              <el-table-column prop="maxBooking" label="每时段可订数" width="120" />
              <el-table-column label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="dark">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openSlot(row)">编辑</el-button>
                  <el-button link type="danger" @click="deleteSlot(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 预订管理 -->
          <el-tab-pane v-if="!isAdmin" label="预订管理" name="bookings">
            <div class="toolbar">
              <el-select v-model="bookingStatus" placeholder="全部状态" clearable class="select" @change="loadBookings(1)">
                <el-option v-for="(t, s) in statusTexts" :key="s" :label="t" :value="Number(s)" />
              </el-select>
              <el-button type="primary" @click="loadBookings(1)">查询</el-button>
            </div>
            <el-table :data="bookings" stripe>
              <el-table-column prop="orderNo" label="订单号" width="170" />
              <el-table-column prop="bookingDate" label="用餐日期" width="110">
                <template #default="{ row }">{{ String(row.bookingDate).slice(0, 10) }}</template>
              </el-table-column>
              <el-table-column prop="guestCount" label="人数" width="70" />
              <el-table-column prop="contactName" label="联系人" width="100" />
              <el-table-column prop="contactPhone" label="联系电话" width="130" />
              <el-table-column label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'warning' : 'info'" size="small" effect="dark">{{ statusTexts[row.status] || `状态${row.status}` }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <template v-if="row.status === 1">
                    <el-button link type="success" @click="handleBooking(row, true)">确认</el-button>
                    <el-button link type="danger" @click="handleBooking(row, false)">拒绝</el-button>
                  </template>
                  <span v-else class="muted">-</span>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination layout="prev, pager, next, total" :total="bookingTotal" :page-size="10" :current-page="bookingPage" class="pager" @current-change="loadBookings" />
          </el-tab-pane>

          <!-- 农产品 -->
          <el-tab-pane v-if="!isAdmin" label="农产品" name="farm">
            <div class="toolbar">
              <el-input v-model="farmKeyword" placeholder="搜索农产品" class="search" clearable @keyup.enter="loadFarm(1)" />
              <el-button type="primary" @click="loadFarm(1)">查询</el-button>
              <el-button type="success" @click="openFarm()">新增农产品</el-button>
            </div>
            <el-table :data="farms" stripe>
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="name" label="名称" />
              <el-table-column label="价格" width="90">
                <template #default="{ row }"><span class="money">¥{{ row.price }}</span></template>
              </el-table-column>
              <el-table-column prop="spec" label="规格" width="110" />
              <el-table-column prop="stock" label="库存" width="80" />
              <el-table-column prop="sales" label="销量" width="80" />
              <el-table-column label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="dark">{{ row.status === 1 ? '上架中' : '已下架' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="170">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openFarm(row)">编辑</el-button>
                  <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleFarm(row)">{{ row.status === 1 ? '下架' : '上架' }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination layout="prev, pager, next, total" :total="farmTotal" :page-size="10" :current-page="farmPage" class="pager" @current-change="loadFarm" />
          </el-tab-pane>

        <!-- 评价管理 -->
        <el-tab-pane label="评价管理" name="reviews">
          <div class="toolbar">
            <el-select v-model="reviewBizType" placeholder="全部类型" clearable class="select" @change="loadReviews(1)">
              <el-option label="餐厅评价" value="restaurant" />
              <el-option label="商品评价" value="farm_product" />
            </el-select>
            <el-button type="primary" @click="loadReviews(1)">查询</el-button>
          </div>
          <el-table :data="reviews" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column label="类型" width="90">
              <template #default="{ row }">{{ row.bizType === 'restaurant' ? '餐厅' : '商品' }}</template>
            </el-table-column>
            <el-table-column prop="userNickname" label="用户" width="110" />
            <el-table-column label="评分" width="90">
              <template #default="{ row }"><el-rate :model-value="row.rating" disabled size="small" /></template>
            </el-table-column>
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="merchantReply" label="回复" width="160" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.isHidden === 1 ? 'info' : 'success'" size="small" effect="dark">{{ row.isHidden === 1 ? '已隐藏' : '正常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="replyReview(row)">回复</el-button>
                <el-button v-if="isAdmin" link :type="row.isHidden === 1 ? 'success' : 'warning'" @click="hideReview(row)">{{ row.isHidden === 1 ? '显示' : '隐藏' }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination layout="prev, pager, next, total" :total="reviewTotal" :page-size="10" :current-page="reviewPage" class="pager" @current-change="loadReviews" />
        </el-tab-pane>

        <!-- 分类管理（仅管理员） -->
        <el-tab-pane v-if="isAdmin" label="分类管理" name="categories">
          <div class="toolbar">
            <el-button type="success" @click="openCategory()">新增分类</el-button>
          </div>
          <el-table :data="allCats" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="name" label="分类名称" />
            <el-table-column prop="sort" label="排序" width="90" />
            <el-table-column prop="icon" label="图标" width="240" />
            <el-table-column label="操作" width="140">
              <template #default="{ row }">
                <el-button link type="primary" @click="openCategory(row)">编辑</el-button>
                <el-button link type="danger" @click="deleteCategory(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 菜品弹窗 -->
    <el-dialog v-model="dishDialog" :title="dishForm.id ? '编辑菜品' : '新增菜品'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="菜名"><el-input v-model="dishForm.name" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="dishForm.price" :min="0" :precision="2" controls-position="right" /></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="dishForm.mainImage" placeholder="/uploads/seeds/dish-1.jpg" /></el-form-item>
        <el-form-item label="介绍"><el-input v-model="dishForm.intro" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="招牌菜"><el-switch v-model="dishForm.isSignature" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="dishForm.status" :active-value="1" :inactive-value="0" active-text="上架" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dishDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDish">保存</el-button>
      </template>
    </el-dialog>

    <!-- 时段弹窗 -->
    <el-dialog v-model="slotDialog" :title="slotForm.id ? '编辑时段' : '新增时段'" width="420px">
      <el-form label-width="120px">
        <el-form-item label="时段名称"><el-input v-model="slotForm.slotName" placeholder="如 午餐 11:30-13:30" /></el-form-item>
        <el-form-item label="每时段可订数"><el-input-number v-model="slotForm.maxBooking" :min="1" controls-position="right" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="slotForm.status" :active-value="1" :inactive-value="0" active-text="启用" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="slotDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSlot">保存</el-button>
      </template>
    </el-dialog>

    <!-- 农产品弹窗 -->
    <el-dialog v-model="farmDialog" :title="farmForm.id ? '编辑农产品' : '新增农产品'" width="480px">
      <el-form label-width="90px">
        <el-form-item label="名称"><el-input v-model="farmForm.name" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="farmForm.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option v-for="c in farmCats" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格"><el-input-number v-model="farmForm.price" :min="0" :precision="2" controls-position="right" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="farmForm.spec" placeholder="如 500g/箱" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="farmForm.stock" :min="0" controls-position="right" /></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="farmForm.mainImage" placeholder="/uploads/seeds/farm-tea.jpg" /></el-form-item>
        <el-form-item label="产地"><el-input v-model="farmForm.origin" /></el-form-item>
        <el-form-item label="保质期"><el-input v-model="farmForm.shelfLife" placeholder="如 常温 30 天" /></el-form-item>
        <el-form-item label="运费"><el-input-number v-model="farmForm.freight" :min="0" :precision="2" controls-position="right" /></el-form-item>
        <el-form-item label="详情"><el-input v-model="farmForm.detail" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="farmForm.status" :active-value="1" :inactive-value="0" active-text="上架" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="farmDialog = false">取消</el-button>
        <el-button type="primary" @click="saveFarm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类弹窗 -->
    <el-dialog v-model="categoryDialog" :title="categoryForm.id ? '编辑分类' : '新增分类'" width="420px">
      <el-form label-width="80px">
        <el-form-item label="分类名称"><el-input v-model="categoryForm.name" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="categoryForm.sort" :min="0" controls-position="right" /></el-form-item>
        <el-form-item label="图标URL"><el-input v-model="categoryForm.icon" placeholder="/uploads/seeds/cat-tea.jpg" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.userInfo?.role === 'admin');
const tab = ref('stats');

// 统计
const stats = ref<any>({});

// 餐厅
const restForm = reactive<any>({ name: '', address: '', longitude: '', latitude: '', openTime: '11:00-21:00', capacity: 50, avgPrice: 0, mainImage: '', intro: '' });

// 菜品
const dishes = ref<any[]>([]);
const dishDialog = ref(false);
const dishForm = reactive<any>({});

// 时段
const slots = ref<any[]>([]);
const slotDialog = ref(false);
const slotForm = reactive<any>({});

// 预订
const bookingStatus = ref('');
const bookings = ref<any[]>([]);
const bookingTotal = ref(0);
const bookingPage = ref(1);

// 农产品
const farmKeyword = ref('');
const farms = ref<any[]>([]);
const farmTotal = ref(0);
const farmPage = ref(1);
const farmCats = ref<any[]>([]);
const farmDialog = ref(false);
const farmForm = reactive<any>({});

// 分类
const allCats = ref<any[]>([]);
const categoryDialog = ref(false);
const categoryForm = reactive<any>({});

// 评价
const reviewBizType = ref('');
const reviews = ref<any[]>([]);
const reviewTotal = ref(0);
const reviewPage = ref(1);

const statusTexts: Record<number, string> = {
  0: '待支付', 1: '已支付', 2: '已确认', 3: '进行中', 4: '已完成', 5: '已取消', 6: '退款中', 7: '已退款',
};

const reviewBase = computed(() => (isAdmin.value ? '/admin/food/reviews' : '/merchant/food/reviews'));

async function loadStats() {
  try {
    stats.value = await request.get(isAdmin.value ? '/admin/food/stats' : '/merchant/food/stats');
  } catch {
    // 已提示
  }
}

// ---------- 餐厅 ----------
async function loadRestaurant() {
  try {
    const r: any = await request.get('/merchant/food/restaurant');
    if (r) {
      Object.assign(restForm, {
        name: r.name, address: r.address, longitude: r.longitude, latitude: r.latitude,
        openTime: r.openTime, capacity: r.capacity,
        avgPrice: Number(r.avgPrice) || 0, mainImage: r.mainImage, intro: r.intro || '',
      });
    }
  } catch { /* 已提示 */ }
}

async function saveRestaurant() {
  if (!restForm.name || !restForm.address) {
    ElMessage.warning('请填写餐厅名称和地址');
    return;
  }
  try {
    await request.post('/merchant/food/restaurant/save', restForm);
    ElMessage.success('已保存');
  } catch { /* 已提示 */ }
}

// ---------- 菜品 ----------
async function loadDishes() {
  try { dishes.value = await request.get('/merchant/food/dishes'); } catch { /* 已提示 */ }
}

function openDish(row?: any) {
  Object.assign(dishForm, row
    ? { id: row.id, name: row.name, price: Number(row.price), mainImage: row.mainImage, intro: row.intro, isSignature: row.isSignature, status: row.status }
    : { id: undefined, name: '', price: 0, mainImage: '', intro: '', isSignature: 0, status: 1 });
  dishDialog.value = true;
}

async function saveDish() {
  if (!dishForm.name) { ElMessage.warning('请填写菜名'); return; }
  try {
    await request.post('/merchant/food/dishes/save', dishForm);
    ElMessage.success('已保存');
    dishDialog.value = false;
    loadDishes();
  } catch { /* 已提示 */ }
}

async function deleteDish(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除菜品「${row.name}」？`, '提示', { type: 'warning' });
    await request.post(`/merchant/food/dishes/${row.id}/delete`);
    ElMessage.success('已删除');
    loadDishes();
  } catch { /* 取消或已提示 */ }
}

// ---------- 时段 ----------
async function loadSlots() {
  try { slots.value = await request.get('/merchant/food/slots'); } catch { /* 已提示 */ }
}

function openSlot(row?: any) {
  Object.assign(slotForm, row
    ? { id: row.id, slotName: row.slotName, maxBooking: row.maxBooking, status: row.status }
    : { id: undefined, slotName: '', maxBooking: 20, status: 1 });
  slotDialog.value = true;
}

async function saveSlot() {
  if (!slotForm.slotName) { ElMessage.warning('请填写时段名称'); return; }
  try {
    await request.post('/merchant/food/slots/save', slotForm);
    ElMessage.success('已保存');
    slotDialog.value = false;
    loadSlots();
  } catch { /* 已提示 */ }
}

async function deleteSlot(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除时段「${row.slotName}」？`, '提示', { type: 'warning' });
    await request.post(`/merchant/food/slots/${row.id}/delete`);
    ElMessage.success('已删除');
    loadSlots();
  } catch { /* 取消或已提示 */ }
}

// ---------- 预订 ----------
async function loadBookings(p = 1) {
  bookingPage.value = p;
  try {
    const data: any = await request.get('/merchant/food/bookings', {
      params: { status: bookingStatus.value || undefined, page: bookingPage.value, pageSize: 10 },
    });
    bookings.value = data.list || [];
    bookingTotal.value = data.total || 0;
  } catch { /* 已提示 */ }
}

async function handleBooking(row: any, accept: boolean) {
  try {
    let rejectReason = '';
    if (!accept) {
      const r = await ElMessageBox.prompt('拒绝预订将取消订单并释放余量，请填写拒绝原因', '拒绝预订', { inputPlaceholder: '拒绝原因（选填）' });
      rejectReason = r.value || '';
    } else {
      await ElMessageBox.confirm('确认该预订？确认后顾客将收到通知。', '提示', { type: 'warning' });
    }
    await request.post(`/merchant/food/bookings/${row.orderId}/handle`, { accept, rejectReason }, { params: { orderId: row.orderId } });
    ElMessage.success(accept ? '已确认' : '已拒绝');
    loadBookings(bookingPage.value);
  } catch { /* 取消或已提示 */ }
}

// ---------- 农产品 ----------
async function loadFarm(p = 1) {
  farmPage.value = p;
  try {
    const data: any = await request.get('/merchant/food/farm/products', {
      params: { keyword: farmKeyword.value || undefined, page: farmPage.value, pageSize: 10 },
    });
    farms.value = data.list || [];
    farmTotal.value = data.total || 0;
  } catch { /* 已提示 */ }
}

async function loadFarmCats() {
  try { farmCats.value = await request.get('/food/farm/categories'); } catch { /* 已提示 */ }
}

function openFarm(row?: any) {
  Object.assign(farmForm, row
    ? {
        id: row.id, name: row.name, categoryId: row.categoryId, price: Number(row.price), spec: row.spec,
        stock: row.stock, mainImage: row.mainImage, origin: row.origin, shelfLife: row.shelfLife,
        freight: Number(row.freight), detail: row.detail || '', status: row.status,
      }
    : {
        id: undefined, name: '', categoryId: undefined, price: 0, spec: '', stock: 0, mainImage: '',
        origin: '', shelfLife: '', freight: 0, detail: '', status: 1,
      });
  farmDialog.value = true;
}

async function saveFarm() {
  if (!farmForm.name || !farmForm.categoryId) { ElMessage.warning('请填写名称并选择分类'); return; }
  try {
    await request.post('/merchant/food/farm/products/save', farmForm);
    ElMessage.success('已保存');
    farmDialog.value = false;
    loadFarm(farmPage.value);
  } catch { /* 已提示 */ }
}

async function toggleFarm(row: any) {
  try {
    await request.post(`/merchant/food/farm/products/${row.id}/toggle`);
    ElMessage.success('已切换');
    loadFarm(farmPage.value);
  } catch { /* 已提示 */ }
}

// ---------- 分类（管理员） ----------
async function loadAllCats() {
  try { allCats.value = await request.get('/admin/food/categories'); } catch { /* 已提示 */ }
}

function openCategory(row?: any) {
  Object.assign(categoryForm, row
    ? { id: row.id, name: row.name, sort: row.sort, icon: row.icon }
    : { id: undefined, name: '', sort: 0, icon: '' });
  categoryDialog.value = true;
}

async function saveCategory() {
  if (!categoryForm.name) { ElMessage.warning('请填写分类名称'); return; }
  try {
    await request.post('/admin/food/categories/save', categoryForm);
    ElMessage.success('已保存');
    categoryDialog.value = false;
    loadAllCats();
  } catch { /* 已提示 */ }
}

async function deleteCategory(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」？`, '提示', { type: 'warning' });
    await request.post(`/admin/food/categories/${row.id}/delete`);
    ElMessage.success('已删除');
    loadAllCats();
  } catch { /* 取消或已提示 */ }
}

// ---------- 评价 ----------
async function loadReviews(p = 1) {
  reviewPage.value = p;
  try {
    const data: any = await request.get(reviewBase.value, {
      params: { bizType: reviewBizType.value || undefined, page: reviewPage.value, pageSize: 10 },
    });
    reviews.value = data.list || [];
    reviewTotal.value = data.total || 0;
  } catch { /* 已提示 */ }
}

async function replyReview(row: any) {
  try {
    const { value } = await ElMessageBox.prompt('请输入回复内容', '回复评价', { inputValue: row.merchantReply || '' });
    await request.post(`${reviewBase.value}/${row.id}/reply`, { reply: value || '' });
    ElMessage.success('已回复');
    loadReviews(reviewPage.value);
  } catch { /* 取消或已提示 */ }
}

async function hideReview(row: any) {
  const hidden = row.isHidden !== 1;
  try {
    await request.post(`/admin/food/reviews/${row.id}/hide`, { hidden });
    ElMessage.success(hidden ? '已隐藏' : '已显示');
    loadReviews(reviewPage.value);
  } catch { /* 已提示 */ }
}

function reload() {
  if (tab.value === 'stats') loadStats();
  if (tab.value === 'restaurant') loadRestaurant();
  if (tab.value === 'dishes') loadDishes();
  if (tab.value === 'slots') loadSlots();
  if (tab.value === 'bookings') loadBookings(1);
  if (tab.value === 'farm') loadFarm(1);
  if (tab.value === 'reviews') loadReviews(1);
  if (tab.value === 'categories') loadAllCats();
}

onMounted(() => {
  loadStats();
  if (!isAdmin.value) {
    loadRestaurant();
    loadDishes();
    loadSlots();
    loadBookings(1);
    loadFarm(1);
    loadFarmCats();
  }
  loadReviews(1);
  if (isAdmin.value) loadAllCats();
});
</script>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}
.page-title {
  margin-bottom: 16px;
}
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}
.stat-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.stat-card .num {
  font-size: 26px;
  font-weight: bold;
  color: #c0392b;
}
.stat-card .label {
  margin-top: 6px;
  color: #666;
  font-size: 13px;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #eee;
}
.search {
  width: 200px;
}
.select {
  width: 140px;
}
.pager {
  margin-top: 18px;
  justify-content: flex-end;
}
.muted {
  color: #999;
  font-size: 12px;
}
.rest-form {
  max-width: 560px;
}
.money {
  color: #c0392b;
}
.dish-thumb {
  width: 70px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
