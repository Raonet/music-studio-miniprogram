<template>
	<div class="a-menu">
		<div
			class="a-menu__item"
			v-for="(item, index) in list"
			:key="item.id"
			:class="{
				'is-active': index == active
			}"
			@click="select(index)"
		>
			<cl-svg class="mr-3" :name="item.icon" :size="16" v-if="item.icon" />
			<span class="text-[12px] tracking-wider whitespace-nowrap">{{ item.meta?.label }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'a-menu'
});

import { computed, ref, watch } from 'vue';
import { useBase } from '/$/base';
import { useCool } from '/@/cool';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { router, route } = useCool();
const { menu } = useBase();
const { t } = useI18n();

// 选中标识
const active = ref(0);

// 组列表
const list = computed(() => {
	return menu.group.filter(e => e.isShow);
});

// 选择导航
function select(index: number) {
	if (index == active.value) {
		return false;
	}

	// 选中的组
	const item = list.value[index];

	// 获取第一个菜单地址
	const url = menu.getPath(item);

	if (url) {
		// 设置左侧菜单
		menu.setMenu(index);

		// 跳转
		router.push(url);
	} else {
		ElMessage.warning(t('{label} 没有子菜单，请先添加', { label: item.meta?.label }));
	}
}

// 刷新
function refresh() {
	let index = 0;

	function deep(e: Menu.Item, i: number) {
		switch (e.type) {
			case 0:
				if (e.children) {
					e.children.forEach(e => {
						deep(e, i);
					});
				}

				break;
			case 1:
				if (route.path.includes(e.path)) {
					index = i;
				}
				break;
			default:
				break;
		}
	}

	// 遍历所有分组
	list.value.forEach(deep);

	// 确认选择
	active.value = index;

	// 设置该分组下的菜单
	menu.setMenu(index);
}

// 监听变化
watch(
	() => [route.path, menu.group.length],
	() => {
		refresh();
	},
	{
		immediate: true
	}
);
</script>

<style lang="scss" scoped>
.a-menu {
	display: flex;
	align-items: center;
	flex: 1;
	user-select: none;

	&__item {
		display: flex;
		align-items: center;
		height: 30px;
		padding: 0 14px 0 10px;
		border: 1px solid transparent;
		color: #A89F8C;
		position: relative;
		background-color: transparent;
		border-radius: 8px;
		cursor: pointer;
		margin-right: 4px;
		transition: all 0.2s ease;
		font-size: 13px;

		&.is-active {
			border-color: rgba(201, 168, 76, 0.3);
			color: #C9A84C;
			background: rgba(201, 168, 76, 0.1);
		}

		&:hover:not(.is-active) {
			background-color: rgba(201, 168, 76, 0.06);
			color: #F0EDE6;
		}

		&:last-child {
			margin-right: 0;
		}
	}
}
</style>
