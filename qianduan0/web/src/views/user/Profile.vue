<template>
  <div class="profile-page">
    <div class="wd-container wd-page">
      <PageBack />
      <!-- 个人资料头卡 -->
      <header class="wd-card user-hero">
        <el-avatar :size="64" :src="profile.avatar">
          {{ (profile.nickname || '乌').slice(0, 1) }}
        </el-avatar>
        <div class="user-main">
          <h1 class="user-name">{{ profile.nickname || '乌东用户' }}</h1>
          <div class="user-meta">
            <span v-if="profile.phone">{{ profile.phone }}</span>
            <span v-if="profile.region" class="meta-item">{{ profile.region }}</span>
            <span class="meta-item">
              <el-tag v-if="profile.role === 'merchant'" type="warning" size="small">已入驻商家</el-tag>
              <el-tag v-else-if="profile.role === 'admin'" type="danger" size="small">管理员</el-tag>
              <el-tag v-else size="small">普通用户</el-tag>
            </span>
          </div>
        </div>
        <div class="user-actions">
          <el-button v-if="profile.role === 'merchant'" @click="shopDialog = true; loadShop()">
            店铺信息
          </el-button>
          <router-link v-else to="/user/apply-merchant">
            <el-button type="primary">申请成为商家</el-button>
          </router-link>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="wd-card tabs-card">
        <el-tabs v-model="tab">
          <!-- 资料 -->
          <el-tab-pane label="我的资料" name="profile">
            <div class="pane">
              <el-form :model="profileForm" label-width="90px" class="form">
                <el-form-item label="手机号">
                  <span class="static-value">{{ profile.phone || '—' }}</span>
                </el-form-item>
                <el-form-item label="昵称">
                  <el-input v-model="profileForm.nickname" placeholder="给自己起个名字" class="input" />
                </el-form-item>
                <el-form-item label="头像 URL">
                  <el-input v-model="profileForm.avatar" placeholder="图片地址，选填" class="input" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="profileForm.gender">
                    <el-radio :value="0">保密</el-radio>
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="地区">
                  <el-input v-model="profileForm.region" placeholder="如：贵州·乌东" class="input" />
                </el-form-item>
                <el-form-item label="简介">
                  <el-input
                    v-model="profileForm.bio"
                    type="textarea"
                    :rows="3"
                    maxlength="500"
                    show-word-limit
                    placeholder="介绍一下你自己…"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveProfile">保存资料</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="pane">
              <h3 class="pane-title">修改密码</h3>
              <el-form :model="pwdForm" label-width="90px" class="form">
                <el-form-item label="原密码">
                  <el-input v-model="pwdForm.oldPassword" type="password" show-password class="input" />
                </el-form-item>
                <el-form-item label="新密码">
                  <el-input
                    v-model="pwdForm.newPassword"
                    type="password"
                    show-password
                    placeholder="8-20 位，含字母和数字"
                    class="input"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="savePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 收货地址 -->
          <el-tab-pane label="收货地址" name="address">
            <div class="pane">
              <div class="pane-head">
                <span class="pane-count">{{ addresses.length }} 个地址</span>
                <el-button type="primary" @click="openAddress()">新增地址</el-button>
              </div>

              <div v-if="addresses.length" class="addr-list">
                <article v-for="a in addresses" :key="a.id" class="addr">
                  <div class="addr-main">
                    <div class="addr-top">
                      <span class="addr-name">{{ a.receiver }}</span>
                      <span class="addr-phone">{{ a.phone }}</span>
                      <el-tag v-if="a.isDefault" size="small" type="danger">默认</el-tag>
                    </div>
                    <p class="addr-detail">
                      {{ a.province }}{{ a.city }}{{ a.district }}{{ a.detail }}
                    </p>
                  </div>
                  <div class="addr-ops">
                    <el-button link type="primary" @click="openAddress(a)">编辑</el-button>
                    <el-button link type="danger" @click="deleteAddress(a)">删除</el-button>
                  </div>
                </article>
              </div>

              <EmptyState
                v-else
                title="还没有收货地址"
                desc="添加一个地址，下单时就不用重复填写了。"
              >
                <el-button type="primary" @click="openAddress()">新增地址</el-button>
              </EmptyState>
            </div>
          </el-tab-pane>

          <!-- 消息 -->
          <el-tab-pane label="消息通知" name="message">
            <div class="pane">
              <div class="pane-head">
                <span class="pane-count">
                  共 {{ messages.length }} 条 · 未读 {{ unreadCount }} 条
                </span>
                <el-button v-if="unreadCount" @click="markAllRead">全部标为已读</el-button>
              </div>

              <div v-if="messages.length" class="msg-list">
                <article
                  v-for="m in messages"
                  :key="m.id"
                  :class="['msg', { unread: !m.isRead }]"
                >
                  <div class="msg-head">
                    <span class="msg-title">
                      <span v-if="!m.isRead" class="unread-dot"></span>
                      {{ m.title }}
                    </span>
                    <span class="msg-time">{{ formatTime(m.createdAt) }}</span>
                  </div>
                  <p class="msg-content">{{ m.content }}</p>
                </article>
              </div>

              <EmptyState v-else title="暂无消息" desc="订单状态、审核结果等通知会出现在这里。" />
            </div>
          </el-tab-pane>

          <!-- 收藏 -->
          <el-tab-pane label="我的收藏" name="favorite">
            <div class="pane">
              <h3 class="pane-title">商品收藏</h3>
              <div v-if="favProducts.length" class="fav-grid">
                <article
                  v-for="f in favProducts"
                  :key="f.id"
                  class="wd-card wd-card-hover fav-item"
                  @click="$router.push(`/clothing/${f.id}`)"
                >
                  <div class="wd-media fav-media">
                    <img :src="img(f.mainImage, f.title)" :alt="f.title" @error="imgError" />
                  </div>
                  <div class="fav-body">
                    <div class="fav-title clamp-2">{{ f.title }}</div>
                    <div class="fav-price" v-if="f.price"><small>¥</small>{{ f.price }}</div>
                  </div>
                </article>
              </div>
              <EmptyState
                v-else
                title="还没有收藏商品"
                desc="在非遗好物里看到喜欢的，点收藏就会出现在这里。"
              >
                <router-link to="/clothing"><el-button type="primary">去逛逛</el-button></router-link>
              </EmptyState>

              <h3 class="pane-title mt">游记收藏</h3>
              <div v-if="favPosts.length" class="fav-post-list">
                <article
                  v-for="p in favPosts"
                  :key="p.id"
                  class="fav-post"
                  @click="$router.push(`/community/${p.id}`)"
                >
                  <span class="fav-post-title clamp-1">{{ p.title }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </article>
              </div>
              <EmptyState
                v-else
                title="还没有收藏游记"
                desc="读到喜欢的游记，收藏起来方便回看。"
              >
                <router-link to="/community"><el-button type="primary">去社区</el-button></router-link>
              </EmptyState>
            </div>
          </el-tab-pane>

          <!-- 我的游记 -->
          <el-tab-pane label="我的游记" name="posts">
            <div class="pane">
              <div v-if="myPosts.length" class="mypost-list">
                <article v-for="p in myPosts" :key="p.id" class="mypost">
                  <div class="mypost-title">
                    <el-tag v-if="p.status === 0" size="small" type="warning">待审核</el-tag>
                    <el-tag v-else-if="p.status === 2" size="small" type="danger">已驳回</el-tag>
                    <el-tag v-else size="small" type="success">已发布</el-tag>
                    <span class="mypost-name clamp-1">{{ p.title }}</span>
                  </div>
                  <div class="mypost-meta">
                    <span>{{ formatTime(p.createdAt) }}</span>
                    <span class="dot"></span>
                    <span>赞 {{ p.likeCount || 0 }}</span>
                    <span class="dot"></span>
                    <span>评论 {{ p.commentCount || 0 }}</span>
                    <el-button link type="danger" class="del-btn" @click="deletePost(p)">删除</el-button>
                  </div>
                </article>
              </div>

              <EmptyState
                v-else
                title="还没有发布过游记"
                desc="把旅途里的照片和心得写下来，会有人看见。"
              >
                <router-link to="/community/publish"><el-button type="primary">写一篇游记</el-button></router-link>
              </EmptyState>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 地址弹窗 -->
      <el-dialog v-model="addressDialog" :title="addressForm.id ? '编辑地址' : '新增地址'" width="480px">
        <el-form :model="addressForm" label-width="80px">
          <el-form-item label="收货人"><el-input v-model="addressForm.receiver" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="addressForm.phone" /></el-form-item>
          <el-form-item label="省份"><el-input v-model="addressForm.province" /></el-form-item>
          <el-form-item label="城市"><el-input v-model="addressForm.city" /></el-form-item>
          <el-form-item label="区县"><el-input v-model="addressForm.district" /></el-form-item>
          <el-form-item label="详细地址"><el-input v-model="addressForm.detail" /></el-form-item>
          <el-form-item label="默认地址">
            <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="addressDialog = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">保存</el-button>
        </template>
      </el-dialog>

      <!-- 店铺信息弹窗 -->
      <el-dialog v-model="shopDialog" title="店铺信息" width="480px">
        <el-form :model="shopForm" label-width="80px">
          <el-form-item label="店铺名"><el-input v-model="shopForm.shopName" /></el-form-item>
          <el-form-item label="联系人"><el-input v-model="shopForm.contact" /></el-form-item>
          <el-form-item label="联系电话"><el-input v-model="shopForm.contactPhone" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="shopDialog = false">取消</el-button>
          <el-button type="primary" @click="saveShop">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';
import PageBack from '../../components/PageBack.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import { img, imgError } from '../../utils/media';

const userStore = useUserStore();
const tab = ref('profile');
const profile = ref<any>({});
const profileForm = reactive({ nickname: '', avatar: '', gender: 0, region: '', bio: '' });
const pwdForm = reactive({ oldPassword: '', newPassword: '' });

const addresses = ref<any[]>([]);
const addressDialog = ref(false);
const addressForm = reactive<any>({
  id: 0, receiver: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0,
});

const messages = ref<any[]>([]);
const favProducts = ref<any[]>([]);
const favPosts = ref<any[]>([]);
const myPosts = ref<any[]>([]);

const shopDialog = ref(false);
const shopForm = reactive({ shopName: '', contact: '', contactPhone: '' });

const unreadCount = computed(() => messages.value.filter((m) => !m.isRead).length);

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

async function loadProfile() {
  try {
    profile.value = await request.get('/auth/profile');
    profileForm.nickname = profile.value.nickname || '';
    profileForm.avatar = profile.value.avatar || '';
    profileForm.gender = profile.value.gender ?? 0;
    profileForm.region = profile.value.region || '';
    profileForm.bio = profile.value.bio || '';
    userStore.setUserInfo(profile.value);
  } catch {
    // 已提示
  }
}

async function saveProfile() {
  try {
    await request.put('/auth/profile', { ...profileForm });
    ElMessage.success('资料已保存');
    loadProfile();
  } catch {
    // 已提示
  }
}

async function savePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    ElMessage.warning('请填写完整');
    return;
  }
  try {
    await request.put('/auth/password', { ...pwdForm });
    ElMessage.success('密码已修改');
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
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

function openAddress(a?: any) {
  Object.assign(
    addressForm,
    a || { id: 0, receiver: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0 }
  );
  addressDialog.value = true;
}

async function saveAddress() {
  if (
    !addressForm.receiver || !addressForm.phone || !addressForm.province ||
    !addressForm.city || !addressForm.district || !addressForm.detail
  ) {
    ElMessage.warning('请填写完整地址信息');
    return;
  }
  try {
    if (addressForm.id) {
      await request.put(`/user/addresses/${addressForm.id}`, { ...addressForm });
    } else {
      await request.post('/user/addresses', { ...addressForm });
    }
    ElMessage.success('已保存');
    addressDialog.value = false;
    loadAddresses();
  } catch {
    // 已提示
  }
}

async function deleteAddress(a: any) {
  try {
    await ElMessageBox.confirm('确定删除该地址？', '提示', { type: 'warning' });
    await request.post(`/user/addresses/${a.id}/delete`);
    loadAddresses();
  } catch (e: any) {
    // 取消或已提示
  }
}

async function loadMessages() {
  try {
    const data: any = await request.get('/messages/', { params: { page: 1, pageSize: 50 } });
    messages.value = data.list || [];
  } catch {
    // 已提示
  }
}

async function markAllRead() {
  try {
    await request.post('/messages/read');
    ElMessage.success('已全部标为已读');
    loadMessages();
  } catch {
    // 已提示
  }
}

async function loadFavorites() {
  try {
    favProducts.value = await request.get('/clothing/favorites');
  } catch {
    // 已提示
  }
  try {
    favPosts.value = await request.get('/community/my/favorites');
  } catch {
    // 已提示
  }
}

async function loadMyPosts() {
  try {
    myPosts.value = await request.get('/community/my/posts');
  } catch {
    // 已提示
  }
}

async function deletePost(p: any) {
  try {
    await ElMessageBox.confirm('确定删除该游记？', '提示', { type: 'warning' });
    await request.post(`/community/my/posts/${p.id}/delete`);
    ElMessage.success('已删除');
    loadMyPosts();
  } catch (e: any) {
    // 取消或已提示
  }
}

async function loadShop() {
  try {
    const shop: any = await request.get('/merchant/my-shop');
    shopForm.shopName = shop.shopName || '';
    shopForm.contact = shop.contact || '';
    shopForm.contactPhone = shop.contactPhone || '';
  } catch {
    // 已提示
  }
}

async function saveShop() {
  try {
    await request.put('/merchant/my-shop', { ...shopForm });
    ElMessage.success('店铺信息已保存');
    shopDialog.value = false;
  } catch {
    // 已提示
  }
}

onMounted(() => {
  loadProfile();
  loadAddresses();
  loadMessages();
  loadFavorites();
  loadMyPosts();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

/* 头卡 */
.user-hero {
  display: flex;
  align-items: center;
  gap: var(--wd-s5);
  padding: var(--wd-s6);
  margin-bottom: var(--wd-s6);
  background: linear-gradient(135deg, #fcfdff 0%, #ffffff 55%, #f7fafe 100%);
}
.user-main {
  flex: 1;
  min-width: 0;
}
.user-name {
  font-size: 22px;
  font-weight: 800;
  color: var(--wd-text-1);
}
.user-meta {
  display: flex;
  align-items: center;
  gap: var(--wd-s4);
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 13px;
  color: var(--wd-text-3);
}
.meta-item {
  display: inline-flex;
  align-items: center;
}
.user-actions {
  flex-shrink: 0;
}

/* Tab 卡 */
.tabs-card {
  padding: var(--wd-s5) var(--wd-s6) var(--wd-s6);
}
.pane {
  padding: var(--wd-s5) 0 0;
}
.pane + .pane {
  margin-top: var(--wd-s6);
  padding-top: var(--wd-s6);
  border-top: 1px solid var(--wd-border);
}
.pane-title {
  margin-bottom: var(--wd-s4);
  font-size: 16px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.pane-title.mt {
  margin-top: var(--wd-s7);
}
.pane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  margin-bottom: var(--wd-s5);
}
.pane-count {
  font-size: 13px;
  color: var(--wd-text-3);
}

.form {
  max-width: 560px;
}
.input {
  max-width: 340px;
}
.static-value {
  font-size: 14px;
  color: var(--wd-text-2);
}

/* 地址 */
.addr-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s3);
}
.addr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  border: 1px solid var(--wd-border);
  background: #fff;
  transition: all 0.24s var(--wd-ease);
}
.addr:hover {
  border-color: rgba(var(--wd-brand-rgb), 0.28);
  box-shadow: var(--wd-sh-1);
}
.addr-main {
  min-width: 0;
}
.addr-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.addr-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--wd-text-1);
}
.addr-phone {
  font-size: 13px;
  color: var(--wd-text-3);
}
.addr-detail {
  margin-top: 6px;
  font-size: 13px;
  color: var(--wd-text-2);
}
.addr-ops {
  flex-shrink: 0;
}

/* 消息 */
.msg-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s3);
}
.msg {
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  border: 1px solid var(--wd-border);
  transition: all 0.24s var(--wd-ease);
}
.msg.unread {
  border-color: rgba(var(--wd-brand-rgb), 0.22);
  background: var(--wd-brand-soft);
}
.msg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
}
.msg-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: var(--wd-text-1);
}
.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--wd-brand);
}
.msg-time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--wd-text-4);
}
.msg-content {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--wd-text-2);
}

/* 收藏 */
.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: var(--wd-s4);
}
.fav-media {
  height: 128px;
}
.fav-body {
  padding: var(--wd-s3) var(--wd-s4) var(--wd-s4);
}
.fav-title {
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--wd-text-1);
}
.fav-item:hover .fav-title {
  color: var(--wd-brand);
}
.fav-price {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 800;
  color: var(--wd-brand);
}
.fav-price small {
  font-size: 11px;
}

.fav-post-list {
  display: flex;
  flex-direction: column;
}
.fav-post {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  padding: 12px 0;
  border-bottom: 1px dashed var(--wd-border);
  cursor: pointer;
  color: var(--wd-text-2);
  transition: color 0.24s var(--wd-ease);
}
.fav-post:last-child {
  border-bottom: none;
}
.fav-post:hover {
  color: var(--wd-brand);
}
.fav-post-title {
  font-size: 14px;
}

/* 我的游记 */
.mypost-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s3);
}
.mypost {
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  border: 1px solid var(--wd-border);
  transition: all 0.24s var(--wd-ease);
}
.mypost:hover {
  border-color: rgba(var(--wd-brand-rgb), 0.28);
  box-shadow: var(--wd-sh-1);
}
.mypost-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mypost-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--wd-text-1);
}
.mypost-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.mypost-meta .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--wd-border-strong);
}
.del-btn {
  margin-left: auto;
}

@media (max-width: 640px) {
  .user-hero {
    flex-wrap: wrap;
  }
  .input {
    max-width: 100%;
  }
}
</style>
