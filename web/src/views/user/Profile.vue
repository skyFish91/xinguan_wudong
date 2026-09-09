<template>
  <div>
    <TopNav />
    <div class="page">
      <h2>个人中心</h2>

      <!-- 用户信息卡片 -->
      <el-card class="user-card">
        <div class="user-header">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar || defaultAvatar" />
          <div class="user-info">
            <h3>{{ userStore.userInfo?.nickname || '游客' }}</h3>
            <p>手机号：{{ userStore.userInfo?.phone || '未绑定' }}</p>
          </div>
          <el-button type="primary" @click="editProfile">编辑资料</el-button>
        </div>
      </el-card>

      <!-- 功能导航 -->
      <div class="nav-grid">
        <el-card class="nav-item" shadow="hover" @click="$router.push('/orders')">
          <el-icon :size="32" color="#667eea"><ShoppingBag /></el-icon>
          <div class="nav-title">我的订单</div>
        </el-card>
        <el-card class="nav-item" shadow="hover" @click="$router.push('/travel/my-etickets')">
          <el-icon :size="32" color="#764ba2"><Ticket /></el-icon>
          <div class="nav-title">电子票券</div>
        </el-card>
        <el-card class="nav-item" shadow="hover" @click="$router.push('/community?tab=my')">
          <el-icon :size="32" color="#f39c12"><Document /></el-icon>
          <div class="nav-title">我的游记</div>
        </el-card>
        <el-card class="nav-item" shadow="hover" @click="$router.push('/user/favorites')">
          <el-icon :size="32" color="#e74c3c"><Star /></el-icon>
          <div class="nav-title">我的收藏</div>
        </el-card>
      </div>

      <!-- 商家申请 -->
      <el-card class="merchant-card">
        <div class="merchant-header">
          <div>
            <h3>成为商家</h3>
            <p>入驻平台，开启您的线上生意</p>
          </div>
          <el-button type="primary" @click="$router.push('/user/apply-merchant')">
            申请入驻
          </el-button>
        </div>
      </el-card>

      <!-- 地址管理 -->
      <el-card class="address-card">
        <div class="card-header">
          <h3>收货地址</h3>
          <el-button type="primary" link @click="addAddress">添加地址</el-button>
        </div>
        <div v-if="addresses.length" class="address-list">
          <div v-for="addr in addresses" :key="addr.id" class="address-item">
            <div class="address-info">
              <div class="address-name">
                {{ addr.name }} {{ addr.phone }}
                <el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
              </div>
            </div>
            <div class="address-actions">
              <el-button link @click="editAddress(addr)">编辑</el-button>
              <el-button link type="danger" @click="deleteAddress(addr)">删除</el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无收货地址" />
      </el-card>

      <!-- 退出登录 -->
      <div class="logout-section">
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog v-model="addressDialog" :title="editingAddress ? '编辑地址' : '新增地址'" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="省市区">
          <el-input v-model="addressForm.region" placeholder="请选择省市区" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.detail" type="textarea" :rows="3" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ShoppingBag, Ticket, Document, Star } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import { useUserStore } from '../../stores/user';
import request from '../../api/request';

const router = useRouter();
const userStore = useUserStore();

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
const addresses = ref<any[]>([]);
const addressDialog = ref(false);
const editingAddress = ref<any>(null);

const addressForm = reactive({
  name: '',
  phone: '',
  region: '',
  detail: '',
  isDefault: false
});

// 加载地址列表
const loadAddresses = async () => {
  try {
    const data: any = await request.get('/app/user/address/list');
    addresses.value = data.list || [];
  } catch {
    addresses.value = [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        province: '贵州省',
        city: '黔东南州',
        district: '凯里市',
        detail: '某某街道某某小区1栋1单元101',
        isDefault: true
      }
    ];
  }
};

// 编辑资料
const editProfile = () => {
  ElMessage.info('编辑资料功能开发中');
};

// 添加地址
const addAddress = () => {
  editingAddress.value = null;
  Object.assign(addressForm, {
    name: '',
    phone: '',
    region: '',
    detail: '',
    isDefault: false
  });
  addressDialog.value = true;
};

// 编辑地址
const editAddress = (addr: any) => {
  editingAddress.value = addr;
  Object.assign(addressForm, {
    name: addr.name,
    phone: addr.phone,
    region: `${addr.province} ${addr.city} ${addr.district}`,
    detail: addr.detail,
    isDefault: addr.isDefault
  });
  addressDialog.value = true;
};

// 保存地址
const saveAddress = async () => {
  if (!addressForm.name || !addressForm.phone || !addressForm.detail) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  try {
    if (editingAddress.value) {
      await request.post(`/app/user/address/update`, {
        id: editingAddress.value.id,
        ...addressForm
      });
      ElMessage.success('保存成功');
    } else {
      await request.post('/app/user/address/add', addressForm);
      ElMessage.success('添加成功');
    }
    addressDialog.value = false;
    loadAddresses();
  } catch {
    ElMessage.error('操作失败');
  }
};

// 删除地址
const deleteAddress = async (addr: any) => {
  try {
    await ElMessageBox.confirm('确认删除该地址？', '提示', { type: 'warning' });
    await request.post(`/app/user/address/delete`, { id: addr.id });
    ElMessage.success('删除成功');
    loadAddresses();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' });
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/');
  } catch {
    // 取消
  }
};

onMounted(() => {
  loadAddresses();
});
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.user-info p {
  margin: 0;
  color: #999;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.nav-item {
  text-align: center;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  transform: translateY(-4px);
}

.nav-title {
  margin-top: 12px;
  font-size: 14px;
}

.merchant-card {
  margin-bottom: 20px;
}

.merchant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.merchant-header h3 {
  margin: 0 0 4px 0;
}

.merchant-header p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.address-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.address-info {
  flex: 1;
}

.address-name {
  font-weight: bold;
  margin-bottom: 8px;
}

.address-detail {
  color: #666;
  font-size: 14px;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.logout-section {
  text-align: center;
  padding: 40px 0;
}
</style>
