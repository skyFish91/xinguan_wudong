<template>
  <div>
    <TopNav />
    <div class="page">
      <el-card class="apply-card">
        <h2>申请成为乌东文旅商家</h2>
        <p class="subtitle">加入乌东文旅平台，开启您的线上经营之旅</p>

        <el-alert
          v-if="application?.status === 0"
          title="您的商家申请正在审核中"
          type="warning"
          :closable="false"
          show-icon
          class="alert"
        />
        <el-alert
          v-if="application?.status === 2"
          :title="`申请被驳回：${application.rejectReason || '未通过审核'}`"
          type="error"
          :closable="false"
          show-icon
          class="alert"
        />

        <el-form
          v-if="!application || application.status === 2"
          :model="form"
          label-width="120px"
          class="form"
        >
          <el-divider content-position="left">基本信息</el-divider>
          <el-form-item label="商家类型">
            <el-radio-group v-model="form.bizType">
              <el-radio value="individual">个体工商户</el-radio>
              <el-radio value="company">企业</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="店铺名称">
            <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
          </el-form-item>
          <el-form-item label="经营类目">
            <el-checkbox-group v-model="form.categories">
              <el-checkbox value="clothing">非遗商品</el-checkbox>
              <el-checkbox value="food">餐饮美食</el-checkbox>
              <el-checkbox value="hotel">民宿住宿</el-checkbox>
              <el-checkbox value="travel">景区出行</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="店铺简介">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="介绍您的店铺特色" />
          </el-form-item>

          <el-divider content-position="left">联系信息</el-divider>
          <el-form-item label="联系人">
            <el-input v-model="form.contactName" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.contactPhone" maxlength="11" />
          </el-form-item>
          <el-form-item label="店铺地址">
            <el-input v-model="form.address" placeholder="省市区详细地址" />
          </el-form-item>

          <el-divider content-position="left">资质证明</el-divider>
          <el-form-item label="营业执照">
            <el-upload
              action="/api/upload"
              :headers="{ Authorization: `Bearer ${token}` }"
              :on-success="(res: any) => form.licenseUrl = res.url"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button size="small" type="primary">上传营业执照</el-button>
            </el-upload>
            <div v-if="form.licenseUrl" class="upload-preview">
              <img :src="form.licenseUrl" class="preview-img" />
            </div>
          </el-form-item>
          <el-form-item label="身份证照片">
            <el-upload
              action="/api/upload"
              :headers="{ Authorization: `Bearer ${token}` }"
              :on-success="(res: any) => form.idCardUrl = res.url"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button size="small" type="primary">上传身份证</el-button>
            </el-upload>
            <div v-if="form.idCardUrl" class="upload-preview">
              <img :src="form.idCardUrl" class="preview-img" />
            </div>
          </el-form-item>

          <el-divider />
          <el-form-item>
            <el-button type="danger" size="large" :loading="submitting" @click="submit">提交申请</el-button>
            <el-button size="large" @click="$router.back()">返回</el-button>
          </el-form-item>
        </el-form>

        <div v-if="application?.status === 0" class="pending-tip">
          <p>您的申请已提交，预计 1-3 个工作日内完成审核</p>
          <el-button @click="$router.push('/user')">返回个人中心</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const router = useRouter();
const token = localStorage.getItem('token');
const application = ref<any>(null);
const submitting = ref(false);
const form = reactive({
  bizType: 'individual',
  shopName: '',
  categories: [] as string[],
  description: '',
  contactName: '',
  contactPhone: '',
  address: '',
  licenseUrl: '',
  idCardUrl: ''
});

async function loadApplication() {
  try {
    application.value = await request.get('/user/merchant-apply');
  } catch {
    // 未申请过，返回 404
  }
}

async function submit() {
  if (!form.shopName) {
    ElMessage.warning('请输入店铺名称');
    return;
  }
  if (!form.categories.length) {
    ElMessage.warning('请选择经营类目');
    return;
  }
  if (!form.contactName || !form.contactPhone) {
    ElMessage.warning('请填写联系信息');
    return;
  }
  if (!form.licenseUrl) {
    ElMessage.warning('请上传营业执照');
    return;
  }

  submitting.value = true;
  try {
    await request.post('/user/merchant-apply', form);
    ElMessage.success('申请已提交，等待审核');
    loadApplication();
  } catch {
    // 已提示
  } finally {
    submitting.value = false;
  }
}

onMounted(loadApplication);
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.apply-card {
  padding: 30px;
}
h2 {
  text-align: center;
  color: #c0392b;
  margin-bottom: 8px;
}
.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}
.alert {
  margin-bottom: 20px;
}
.form {
  margin-top: 20px;
}
.upload-preview {
  margin-top: 10px;
}
.preview-img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}
.pending-tip {
  text-align: center;
  padding: 40px 20px;
}
.pending-tip p {
  color: #666;
  margin-bottom: 20px;
}
</style>
