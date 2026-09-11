<template>
  <div>
    <TopNav />
    <div class="page">
      <el-card class="profile-card">
        <div class="profile-header">
          <el-avatar :size="80" :src="userInfo.avatar" class="avatar">
            {{ userInfo.nickname?.[0] || '用' }}
          </el-avatar>
          <div class="header-info">
            <h2>{{ userInfo.nickname || '游客' }}</h2>
            <div class="meta">手机号：{{ userInfo.phone }}</div>
            <div class="meta">注册时间：{{ formatTime(userInfo.createdAt) }}</div>
          </div>
          <el-button type="primary" @click="showEditDialog = true">编辑资料</el-button>
        </div>

        <el-divider />

        <el-descriptions title="个人信息" :column="2" border>
          <el-descriptions-item label="真实姓名">{{ userInfo.realName || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ maskIdCard(userInfo.idCard) }}</el-descriptions-item>
          <el-descriptions-item label="账户余额">
            <span class="balance">¥0.00</span>
          </el-descriptions-item>
          <el-descriptions-item label="积分">{{ userInfo.points || 0 }}</el-descriptions-item>
          <el-descriptions-item label="角色" :span="2">
            <el-tag v-if="userInfo.role === 'admin'" type="danger">管理员</el-tag>
            <el-tag v-else-if="userInfo.role === 'merchant'" type="warning">商家</el-tag>
            <el-tag v-else type="info">普通用户</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="actions-section">
          <h3>快捷操作</h3>
          <div class="action-grid">
            <el-card shadow="hover" class="action-card" @click="$router.push('/orders')">
              <div class="action-icon">📦</div>
              <div class="action-title">我的订单</div>
            </el-card>
            <el-card shadow="hover" class="action-card" @click="$router.push('/travel/my-etickets')">
              <div class="action-icon">🎫</div>
              <div class="action-title">我的电子票</div>
            </el-card>
            <el-card shadow="hover" class="action-card" @click="$router.push('/cart')">
              <div class="action-icon">🛒</div>
              <div class="action-title">购物车</div>
            </el-card>
            <el-card shadow="hover" class="action-card" @click="$router.push('/community')">
              <div class="action-icon">📝</div>
              <div class="action-title">我的动态</div>
            </el-card>
            <el-card v-if="userInfo.role !== 'merchant'" shadow="hover" class="action-card" @click="$router.push('/user/apply-merchant')">
              <div class="action-icon">🏪</div>
              <div class="action-title">申请商家</div>
            </el-card>
          </div>
        </div>

        <el-divider />

        <div class="address-section">
          <div class="section-header">
            <h3>收货地址</h3>
            <el-button size="small" type="primary" @click="showAddressDialog = true">新增地址</el-button>
          </div>
          <div v-if="!addresses.length" class="empty-tip">暂无收货地址</div>
          <div v-for="addr in addresses" :key="addr.id" class="address-item">
            <div class="address-main">
              <el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
              <span class="address-name">{{ addr.receiverName }}</span>
              <span class="address-phone">{{ addr.receiverPhone }}</span>
              <div class="address-detail">{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}</div>
            </div>
            <div class="address-ops">
              <el-button link @click="editAddress(addr)">编辑</el-button>
              <el-button link type="danger" @click="deleteAddress(addr)">删除</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 编辑资料弹窗 -->
      <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="昵称">
            <el-input v-model="editForm.nickname" />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="editForm.realName" />
          </el-form-item>
          <el-form-item label="身份证号">
            <el-input v-model="editForm.idCard" maxlength="18" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="updateProfile">保存</el-button>
        </template>
      </el-dialog>

      <!-- 地址弹窗 -->
      <el-dialog v-model="showAddressDialog" :title="addressForm.id ? '编辑地址' : '新增地址'" width="500px">
        <el-form :model="addressForm" label-width="80px">
          <el-form-item label="收货人">
            <el-input v-model="addressForm.receiverName" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="addressForm.receiverPhone" maxlength="11" />
          </el-form-item>
          <el-form-item label="省市区">
            <el-input v-model="addressForm.province" placeholder="省" style="width: 30%" />
            <el-input v-model="addressForm.city" placeholder="市" style="width: 34%; margin: 0 2%" />
            <el-input v-model="addressForm.district" placeholder="区" style="width: 30%" />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="addressForm.detail" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item label="设为默认">
            <el-switch v-model="addressForm.isDefault" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddressDialog = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const userInfo = ref<any>({});
const addresses = ref<any[]>([]);
const showEditDialog = ref(false);
const showAddressDialog = ref(false);
const editForm = reactive({ nickname: '', realName: '', idCard: '' });
const addressForm = reactive({
  id: 0,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
});

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 10) : '';
}

function maskIdCard(s?: string) {
  if (!s) return '未设置';
  return s.slice(0, 6) + '****' + s.slice(-4);
}

async function loadProfile() {
  try {
    userInfo.value = await request.get('/auth/profile');
    userStore.setUserInfo(userInfo.value);
    Object.assign(editForm, {
      nickname: userInfo.value.nickname,
      realName: userInfo.value.realName || '',
      idCard: userInfo.value.idCard || ''
    });
  } catch {
    // 已提示
  }
}

async function loadAddresses() {
  try {
    addresses.value = await request.get('/user/addresses');
  } catch {
    // 已提示
  }
}

async function updateProfile() {
  try {
    await request.put('/auth/profile', editForm);
    ElMessage.success('资料已更新');
    showEditDialog.value = false;
    loadProfile();
  } catch {
    // 已提示
  }
}

function editAddress(addr: any) {
  Object.assign(addressForm, addr);
  showAddressDialog.value = true;
}

async function saveAddress() {
  if (!addressForm.receiverName || !addressForm.receiverPhone || !addressForm.detail) {
    ElMessage.warning('请填写完整地址信息');
    return;
  }
  try {
    if (addressForm.id) {
      await request.put(`/user/addresses/${addressForm.id}`, addressForm);
    } else {
      await request.post('/user/addresses', addressForm);
    }
    ElMessage.success('地址已保存');
    showAddressDialog.value = false;
    loadAddresses();
  } catch {
    // 已提示
  }
}

async function deleteAddress(addr: any) {
  try {
    await ElMessageBox.confirm('确定删除该地址？', '提示', { type: 'warning' });
    await request.delete(`/user/addresses/${addr.id}`);
    ElMessage.success('地址已删除');
    loadAddresses();
  } catch {
    // 取消或已提示
  }
}

onMounted(() => {
  loadProfile();
  loadAddresses();
});
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.profile-card {
  padding: 24px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.avatar {
  background: #c0392b;
  font-size: 32px;
  font-weight: bold;
}
.header-info {
  flex: 1;
}
.meta {
  color: #666;
  font-size: 14px;
  margin-top: 6px;
}
.balance {
  color: #c0392b;
  font-weight: bold;
  font-size: 18px;
}
.actions-section h3,
.section-header h3 {
  margin-bottom: 16px;
}
.action-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.action-card {
  text-align: center;
  cursor: pointer;
  padding: 20px;
}
.action-card:hover {
  transform: translateY(-4px);
  transition: transform 0.2s;
}
.action-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.action-title {
  font-weight: 600;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.empty-tip {
  color: #999;
  text-align: center;
  padding: 20px;
}
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 12px;
}
.address-main {
  flex: 1;
}
.address-name {
  font-weight: 600;
  margin: 0 12px;
}
.address-phone {
  color: #666;
}
.address-detail {
  margin-top: 6px;
  color: #555;
}
.address-ops {
  display: flex;
  gap: 8px;
}
</style>
