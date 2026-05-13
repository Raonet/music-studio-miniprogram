<template>
	<div
		class="app-slider"
		:class="{
			'is-collapse': app.isFold
		}"
	>
		<div class="app-slider__logo">
			<img src="/logo.png" />
			<span v-if="!app.isFold || browser.isMini">{{ app.info.name }}</span>
		</div>

		<div class="app-slider__search">
			<el-input
				v-model="keyWord"
				:placeholder="$t('搜索关键字')"
				clearable
				@focus="app.fold(false)"
			>
				<template #prefix>
					<cl-svg name="search" :size="16" />
				</template>
			</el-input>
		</div>

		<div class="app-slider__container">
			<el-scrollbar>
				<b-menu :keyWord="keyWord" />
			</el-scrollbar>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'app-slider'
});

import { useBase } from '/$/base';
import { useBrowser } from '/@/cool';
import BMenu from './bmenu';
import { ref } from 'vue';

const { browser } = useBrowser();
const { app } = useBase();

const keyWord = ref('');
</script>

<style lang="scss">
.app-slider {
	$slider-menu-height: 46px;
	--slider-bg-color: #0e0d14;
	--slider-text-color: #A89F8C;

	height: 100%;
	background: linear-gradient(180deg, #0e0d14 0%, #13111a 100%);
	border-right: 1px solid rgba(201, 168, 76, 0.12);
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.3), transparent);
		pointer-events: none;
	}

	&__logo {
		display: flex;
		align-items: center;
		height: 66px;
		padding: 0 20px;
		user-select: none;
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);

		img {
			height: 26px;
			width: 26px;
			border-radius: 6px;
		}

		span {
			color: #F0EDE6;
			font-weight: 700;
			font-size: 18px;
			margin-left: 10px;
			white-space: nowrap;
			letter-spacing: 1px;
			background: linear-gradient(135deg, #F0EDE6 0%, #C9A84C 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}
	}

	&__search {
		margin: 12px 10px 8px 10px;
		overflow: hidden;
		border-radius: 8px;

		.el-input__wrapper {
			background-color: rgba(201, 168, 76, 0.06);
			box-shadow: none !important;
			height: 34px;
			padding: 0 12px;
			border: 1px solid rgba(201, 168, 76, 0.12);
			border-radius: 8px;
			transition: border-color 0.2s;

			&:hover, &.is-focus {
				border-color: rgba(201, 168, 76, 0.3);
			}

			.el-input__inner {
				color: var(--slider-text-color);
				font-size: 13px;

				&::placeholder {
					color: rgba(168, 159, 140, 0.5);
				}
			}

			.el-input__prefix {
				color: rgba(201, 168, 76, 0.5);
			}
		}
	}

	&__container {
		height: calc(100% - 120px);
	}

	&__menu {
		user-select: none;
		padding: 4px 8px;

		.b-menu__badge {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 14px;
			min-width: 14px;
			padding: 0 4px;
			border-radius: 4px;
			background-color: rgba(201, 168, 76, 0.25);
			font-weight: 700;
			font-size: 10px;
			color: #C9A84C;
			transition: background-color 0.2s;
		}

		.el-menu {
			width: 100%;
			border-right: 0;
			background-color: transparent;

			&--popup {
				border-radius: 10px;
				padding: 6px;
				background: rgba(14, 13, 20, 0.95);
				backdrop-filter: blur(16px);
				border: 1px solid rgba(201, 168, 76, 0.15);
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

				&-container {
					padding: 0;
				}

				.el-menu-item,
				.el-sub-menu__title {
					height: $slider-menu-height;
					border-radius: 8px;
					color: #A89F8C;

					&:hover {
						background-color: rgba(201, 168, 76, 0.08);
						color: #F0EDE6;
					}
				}
			}

			&:not(&--popup) {
				--el-menu-base-level-padding: 20px;

				.el-menu-item,
				.el-sub-menu__title {
					height: $slider-menu-height;
					color: var(--slider-text-color);
					border-radius: 8px;
					margin-bottom: 2px;
					transition: all 0.2s ease;

					.cl-svg {
						flex-shrink: 0;
					}

					&:hover {
						background-color: rgba(201, 168, 76, 0.08);
						color: #F0EDE6;
					}

					&.is-active {
						background: linear-gradient(135deg, rgba(201, 168, 76, 0.2), rgba(201, 168, 76, 0.08));
						color: #C9A84C;
						border: 1px solid rgba(201, 168, 76, 0.2);
						box-shadow: 0 2px 8px rgba(201, 168, 76, 0.1);
					}
				}
			}
		}
	}

	&.is-collapse {
		.app-slider__search {
			.el-input__inner {
				opacity: 0;
			}
		}

		.app-slider__menu {
			padding: 4px 4px;

			.el-sub-menu {
				&.is-active {
					background: rgba(201, 168, 76, 0.12);
					border-radius: 8px;
				}
			}
		}
	}
}
</style>
