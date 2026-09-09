<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 批量删除 -->
			<cl-multi-delete-btn />
			<cl-flex1 />
			<!-- 搜索 -->
			<cl-search-key :placeholder="$t('搜索评论内容')" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table">
				<!-- 状态 -->
				<template #column-status="{ scope }">
					<el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
					<el-tag v-else type="danger">已删除</el-tag>
				</template>

				<!-- 评论内容 -->
				<template #column-content="{ scope }">
					<div style="max-width: 400px; word-break: break-all">
						{{ scope.row.content }}
					</div>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'community-comment'
});

import { useTable, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

// cl-crud
const Crud = useCrud(
	{
		service: service.community.admin.noteComment
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
			prop: 'postId',
			label: t('游记ID'),
			width: 100
		},
		{
			prop: 'userId',
			label: t('用户ID'),
			width: 100
		},
		{
			prop: 'content',
			label: t('评论内容'),
			minWidth: 300
		},
		{
			prop: 'parentId',
			label: t('父评论ID'),
			width: 100
		},
		{
			prop: 'likeCount',
			label: t('点赞数'),
			width: 100
		},
		{
			prop: 'status',
			label: t('状态'),
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
			buttons: ['delete'],
			width: 120
		}
	]
});
</script>
