<template>
	<div class="app-topbar">
		<div class="cl-comm__icon mr-[10px]" @click="app.fold()">
			<cl-svg name="fold" v-if="app.isFold" />
			<cl-svg name="expand" v-else />
		</div>

		<!-- 路由导航 -->
		<a-menu v-if="app.info.menu.isGroup" />
		<route-nav v-else />

		<div class="flex1"></div>

		<!-- 工具栏 -->
		<ul class="app-topbar__tools">
			<li v-for="(item, index) in toolbarComponents" :key="index">
				<component :is="item.component" />
			</li>
		</ul>

		<!-- 用户信息 -->
		<template v-if="user.info">
			<el-dropdown
				hide-on-click
				popper-class="app-topbar__user-popper"
				:popper-options="{}"
				@command="onCommand"
			>
				<div class="app-topbar__user">
					<el-text class="mr-[10px]">{{ user.info.nickName }}</el-text>
					<cl-avatar :size="26" :src="user.info.headImg" />
				</div>

				<template #dropdown>
					<div class="user">
						<cl-avatar :size="34" :src="user.info.headImg" />

						<div class="det">
							<el-text size="small" tag="p">{{ user.info.nickName }}</el-text>
							<el-text size="small" type="info">{{ user.info.email }}</el-text>
						</div>
					</div>

					<el-dropdown-menu>
						<el-dropdown-item command="my">
							<cl-svg name="my" />
							<span>{{ t('个人中心') }}</span>
						</el-dropdown-item>
						<el-dropdown-item command="exit">
							<cl-svg name="exit" />
							<span>{{ t('退出登录') }}</span>
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</template>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'app-topbar'
});

import { computed, markRaw, onMounted, reactive } from 'vue';
import { isFunction, orderBy } from 'lodash-es';
import { useBase } from '/$/base';
import { module, useCool } from '/@/cool';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import RouteNav from './route-nav.vue';
import AMenu from './amenu.vue';

const { router, service, browser } = useCool();
const { user, app } = useBase();
const { t } = useI18n();

// 命令事件
async function onCommand(name: string) {
	switch (name) {
		case 'my':
			router.push('/my/info');
			break;
		case 'exit':
			ElMessageBox.confirm(t('确定退出登录吗？'), t('提示'), {
				type: 'warning'
			})
				.then(async () => {
					await service.base.comm.logout();
					user.logout();
				})
				.catch(() => null);
			break;
	}
}

// 工具栏
const toolbar = reactive({
	list: [] as any[],

	async init() {
		const arr = orderBy(
			module.list.filter(e => e.enable !== false && !!e.toolbar).map(e => e.toolbar),
			'order'
		);

		this.list = await Promise.all(
			arr
				.filter(e => e?.component)
				.map(async e => {
					if (e) {
						const c = await (isFunction(e.component) ? e.component() : e.component);

						return {
							...e,
							component: markRaw(c.default || c)
						};
					}
				})
		);
	}
});

// 工具栏组件
const toolbarComponents = computed(() => {
	return toolbar.list.filter(e => {
		if (browser.isMini) {
			return e?.h5 ?? true;
		}

		return e?.pc ?? true;
	});
});

onMounted(() => {
	toolbar.init();
});
</script>

<style lang="scss" scoped>
.app-topbar {
	display: flex;
	align-items: center;
	height: 52px;
	padding: 0 12px;
	background: rgba(14, 13, 20, 0.85);
	backdrop-filter: blur(16px) saturate(1.4);
	-webkit-backdrop-filter: blur(16px) saturate(1.4);
	border-bottom: 1px solid rgba(201, 168, 76, 0.12);
	box-sizing: border-box;
	transition: height 0.2s ease-in-out;

	.flex1 {
		flex: 1;
	}

	&__tools {
		display: flex;
		margin-right: 10px;

		& > li {
			display: flex;
			justify-content: center;
			align-items: center;
			list-style: none;
			height: 45px;
			cursor: pointer;
			margin-left: 8px;
		}
	}

	&__user {
		display: flex;
		align-items: center;
		outline: none;
		cursor: pointer;
		white-space: nowrap;
		padding: 5px 8px 5px 10px;
		border-radius: 8px;
		border: 1px solid transparent;
		transition: all 0.2s ease;

		:deep(.el-text) {
			color: #A89F8C;
			font-size: 13px;
		}

		&:hover {
			background-color: rgba(201, 168, 76, 0.08);
			border-color: rgba(201, 168, 76, 0.2);

			:deep(.el-text) {
				color: #F0EDE6;
			}
		}
	}

	:deep(.cl-comm__icon) {
		background: rgba(201, 168, 76, 0.06);
		border-color: rgba(201, 168, 76, 0.15);

		.cl-svg {
			color: #A89F8C;
		}

		&:hover {
			border-color: rgba(201, 168, 76, 0.4);
			background-color: rgba(201, 168, 76, 0.12);

			.cl-svg {
				color: #C9A84C;
			}
		}
	}
}
</style>

<style lang="scss">
.app-topbar__user-popper {
	background: rgba(14, 13, 20, 0.95) !important;
	backdrop-filter: blur(16px);
	border: 1px solid rgba(201, 168, 76, 0.15) !important;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;

	.el-dropdown-menu {
		background: transparent;
		padding: 6px;

		&__item {
			padding: 7px 12px;
			font-size: 13px;
			color: #A89F8C;
			border-radius: 6px;
			transition: all 0.15s ease;

			&:hover {
				background-color: rgba(201, 168, 76, 0.1);
				color: #F0EDE6;
			}
		}
	}

	.user {
		display: flex;
		align-items: center;
		padding: 12px 12px;
		width: 200px;
		border-bottom: 1px solid rgba(201, 168, 76, 0.1);

		.det {
			margin-left: 10px;
			flex: 1;
			font-size: 12px;

			p { color: #F0EDE6; margin: 0 0 2px; }
			.el-text--info { color: #A89F8C; }
		}
	}

	.cl-svg {
		margin-right: 8px;
		font-size: 16px;
		color: #C9A84C;
	}
}
</style>
