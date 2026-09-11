<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<cl-flex1 />
			<!-- 搜索 -->
			<cl-search-key :placeholder="$t('搜索标题/内容')" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table">
				<!-- 封面图 -->
				<template #column-cover="{ scope }">
					<el-image
						v-if="scope.row.cover"
						:src="scope.row.cover"
						:preview-src-list="[scope.row.cover]"
						style="width: 80px; height: 80px; border-radius: 4px"
						fit="cover"
					/>
				</template>

				<!-- 状态 -->
				<template #column-status="{ scope }">
					<el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
					<el-tag v-else-if="scope.row.status === 2" type="warning">审核中</el-tag>
					<el-tag v-else-if="scope.row.status === 3" type="info">已下架</el-tag>
					<el-tag v-else type="danger">已删除</el-tag>
				</template>

				<!-- 审核状态 -->
				<template #column-auditStatus="{ scope }">
					<el-tag v-if="scope.row.auditStatus === 0" type="info">待审</el-tag>
					<el-tag v-else-if="scope.row.auditStatus === 1" type="success">机审通过</el-tag>
					<el-tag v-else-if="scope.row.auditStatus === 2" type="success">人工通过</el-tag>
					<el-tag v-else type="danger">已拒绝</el-tag>
				</template>

				<!-- 操作栏 -->
				<template #slot-btn="{ scope }">
					<el-button
						v-if="scope.row.status === 2 && scope.row.auditStatus === 0"
						text
						type="success"
						@click="auditPass(scope.row)"
					>
						审核通过
					</el-button>
					<el-button
						v-if="scope.row.status === 2 && scope.row.auditStatus === 0"
						text
						type="danger"
						@click="auditReject(scope.row)"
					>
						审核拒绝
					</el-button>
					<el-button
						v-if="scope.row.status === 1"
						text
						type="warning"
						@click="offShelf([scope.row.id])"
					>
						下架
					</el-button>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 审核拒绝对话框 -->
		<el-dialog v-model="rejectDialogVisible" title="审核拒绝" width="500px">
			<el-form label-width="80px">
				<el-form-item label="拒绝原因">
					<el-input
						v-model="rejectReason"
						type="textarea"
						:rows="4"
						placeholder="请输入拒绝原因"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="rejectDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmReject">确定</el-button>
			</template>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'community-post'
});

import { useTable, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

// 审核拒绝
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const currentPostId = ref(0);

// cl-crud
const Crud = useCrud(
	{
		service: service.community.admin.notePost
	},
	(app) => {
		app.refresh();
	}
);

// cl-table
const Table = useTable({
	columns: [
		{
			type: 'selection',
			width: 60
		},
		{
			prop: 'id',
			label: 'ID',
			width: 80
		},
		{
			prop: 'cover',
			label: t('封面'),
			width: 100
		},
		{
			prop: 'title',
			label: t('标题'),
			width: 200,
			showOverflowTooltip: true
		},
		{
			prop: 'content',
			label: t('内容'),
			width: 300,
			showOverflowTooltip: true
		},
		{
			prop: 'userId',
			label: t('作者ID'),
			width: 100
		},
		{
			prop: 'status',
			label: t('状态'),
			width: 100
		},
		{
			prop: 'auditStatus',
			label: t('审核状态'),
			width: 100
		},
		{
			prop: 'likeCount',
			label: t('点赞数'),
			width: 100
		},
		{
			prop: 'commentCount',
			label: t('评论数'),
			width: 100
		},
		{
			prop: 'viewCount',
			label: t('浏览数'),
			width: 100
		},
		{
			prop: 'createTime',
			label: t('创建时间'),
			sortable: 'desc',
			width: 160
		},
		{
			type: 'op',
			buttons: ['slot-btn', 'delete'],
			width: 280
		}
	]
});

// 审核通过
async function auditPass(row: any) {
	await ElMessageBox.confirm('确认审核通过该游记？', '提示', {
		type: 'warning'
	});

	await service.community.admin.notePost.auditPass({ id: row.id });
	ElMessage.success('审核通过');
	Crud.value?.refresh();
}

// 打开审核拒绝对话框
function auditReject(row: any) {
	currentPostId.value = row.id;
	rejectReason.value = '';
	rejectDialogVisible.value = true;
}

// 确认审核拒绝
async function confirmReject() {
	if (!rejectReason.value) {
		ElMessage.warning('请输入拒绝原因');
		return;
	}

	await service.community.admin.notePost.auditReject({
		id: currentPostId.value,
		reason: rejectReason.value
	});

	ElMessage.success('已拒绝');
	rejectDialogVisible.value = false;
	Crud.value?.refresh();
}

// 下架
async function offShelf(ids: number[]) {
	await ElMessageBox.confirm('确认下架选中的游记？', '提示', {
		type: 'warning'
	});

	await service.community.admin.notePost.offShelf({ ids });
	ElMessage.success('已下架');
	Crud.value?.refresh();
}
</script>
