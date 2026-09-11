<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<cl-flex1 />
			<!-- 搜索 -->
			<cl-search-key :placeholder="$t('搜索举报原因')" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table">
				<!-- 举报目标类型 -->
				<template #column-targetType="{ scope }">
					<el-tag v-if="scope.row.targetType === 'POST'" type="primary">游记</el-tag>
					<el-tag v-else type="info">评论</el-tag>
				</template>

				<!-- 处理状态 -->
				<template #column-status="{ scope }">
					<el-tag v-if="scope.row.status === 0" type="warning">待处理</el-tag>
					<el-tag v-else-if="scope.row.status === 1" type="success">已处理</el-tag>
					<el-tag v-else type="info">已驳回</el-tag>
				</template>

				<!-- 操作栏 -->
				<template #slot-btn="{ scope }">
					<el-button
						v-if="scope.row.status === 0"
						text
						type="primary"
						@click="handleReport(scope.row)"
					>
						处理
					</el-button>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 处理举报对话框 -->
		<el-dialog v-model="handleDialogVisible" title="处理举报" width="600px">
			<el-form :model="handleForm" label-width="100px">
				<el-form-item label="举报原因">
					<div>{{ handleForm.reason }}</div>
				</el-form-item>
				<el-form-item label="处理方式">
					<el-radio-group v-model="handleForm.action">
						<el-radio label="delete">删除内容</el-radio>
						<el-radio label="warn">警告用户</el-radio>
						<el-radio label="reject">驳回举报</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="处理结果">
					<el-input
						v-model="handleForm.result"
						type="textarea"
						:rows="4"
						placeholder="请输入处理结果"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="handleDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmHandle">确定</el-button>
			</template>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'community-report'
});

import { useTable, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

// 处理举报
const handleDialogVisible = ref(false);
const handleForm = reactive({
	id: 0,
	reason: '',
	action: 'delete',
	result: ''
});

// cl-crud
const Crud = useCrud(
	{
		service: service.community.admin.noteReport
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
			prop: 'userId',
			label: t('举报人ID'),
			width: 100
		},
		{
			prop: 'targetType',
			label: t('目标类型'),
			width: 100
		},
		{
			prop: 'targetId',
			label: t('目标ID'),
			width: 100
		},
		{
			prop: 'reason',
			label: t('举报原因'),
			minWidth: 250,
			showOverflowTooltip: true
		},
		{
			prop: 'status',
			label: t('状态'),
			width: 100
		},
		{
			prop: 'handleResult',
			label: t('处理结果'),
			width: 200,
			showOverflowTooltip: true
		},
		{
			prop: 'handleBy',
			label: t('处理人ID'),
			width: 100
		},
		{
			prop: 'handleTime',
			label: t('处理时间'),
			width: 160
		},
		{
			prop: 'createTime',
			label: t('创建时间'),
			sortable: 'desc',
			width: 160
		},
		{
			type: 'op',
			buttons: ['slot-btn'],
			width: 120
		}
	]
});

// 打开处理对话框
function handleReport(row: any) {
	handleForm.id = row.id;
	handleForm.reason = row.reason;
	handleForm.action = 'delete';
	handleForm.result = '';
	handleDialogVisible.value = true;
}

// 确认处理
async function confirmHandle() {
	if (!handleForm.result) {
		ElMessage.warning('请输入处理结果');
		return;
	}

	await service.community.admin.noteReport.handle({
		id: handleForm.id,
		action: handleForm.action,
		result: handleForm.result
	});

	ElMessage.success('处理成功');
	handleDialogVisible.value = false;
	Crud.value?.refresh();
}
</script>
