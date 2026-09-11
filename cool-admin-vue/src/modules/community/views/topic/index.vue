<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 新增按钮 -->
			<cl-add-btn />
			<!-- 批量删除 -->
			<cl-multi-delete-btn />
			<cl-flex1 />
			<!-- 搜索 -->
			<cl-search-key :placeholder="$t('搜索话题名')" />
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
						style="width: 60px; height: 60px; border-radius: 4px"
						fit="cover"
					/>
				</template>

				<!-- 是否推荐 -->
				<template #column-isRecommend="{ scope }">
					<el-tag v-if="scope.row.isRecommend === 1" type="success">是</el-tag>
					<el-tag v-else type="info">否</el-tag>
				</template>

				<!-- 状态 -->
				<template #column-status="{ scope }">
					<el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
					<el-tag v-else type="danger">停用</el-tag>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'community-topic'
});

import { useTable, useUpsert, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

// cl-crud
const Crud = useCrud(
	{
		service: service.community.admin.noteTopic
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
			prop: 'name',
			label: t('话题名'),
			width: 200
		},
		{
			prop: 'cover',
			label: t('封面'),
			width: 100
		},
		{
			prop: 'intro',
			label: t('简介'),
			minWidth: 200,
			showOverflowTooltip: true
		},
		{
			prop: 'postCount',
			label: t('游记数'),
			width: 100
		},
		{
			prop: 'followCount',
			label: t('关注数'),
			width: 100
		},
		{
			prop: 'isRecommend',
			label: t('推荐'),
			width: 80
		},
		{
			prop: 'sort',
			label: t('排序'),
			width: 80
		},
		{
			prop: 'status',
			label: t('状态'),
			width: 80
		},
		{
			prop: 'createTime',
			label: t('创建时间'),
			sortable: 'desc',
			width: 160
		},
		{
			type: 'op',
			buttons: ['edit', 'delete'],
			width: 160
		}
	]
});

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			prop: 'name',
			label: t('话题名'),
			component: {
				name: 'el-input',
				props: {
					placeholder: t('请输入话题名')
				}
			},
			required: true
		},
		{
			prop: 'cover',
			label: t('封面图'),
			component: {
				name: 'cl-upload',
				props: {
					text: t('选择图片')
				}
			}
		},
		{
			prop: 'intro',
			label: t('话题简介'),
			component: {
				name: 'el-input',
				props: {
					type: 'textarea',
					rows: 4,
					placeholder: t('请输入话题简介')
				}
			}
		},
		{
			prop: 'isRecommend',
			label: t('是否推荐'),
			value: 0,
			component: {
				name: 'el-radio-group',
				options: [
					{ label: t('否'), value: 0 },
					{ label: t('是'), value: 1 }
				]
			}
		},
		{
			prop: 'sort',
			label: t('排序'),
			value: 0,
			component: {
				name: 'el-input-number',
				props: {
					min: 0,
					max: 9999
				}
			}
		},
		{
			prop: 'status',
			label: t('状态'),
			value: 1,
			component: {
				name: 'el-radio-group',
				options: [
					{ label: t('停用'), value: 0 },
					{ label: t('启用'), value: 1 }
				]
			}
		}
	]
});
</script>
