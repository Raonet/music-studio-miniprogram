<template>
	<div class="pic-captcha" @click="refresh">
		<div v-if="svg" class="svg" v-html="svg" />
		<img v-else-if="base64" class="base64" :src="base64" alt="" />

		<template v-else>
			<el-icon class="is-loading" :size="18">
				<loading />
			</el-icon>
		</template>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'pic-captcha'
});

import { onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:modelValue', 'change']);

const { service } = useCool();
const { t } = useI18n();

// base64
const base64 = ref('');

// svg
const svg = ref('');

// 刷新
async function refresh() {
	svg.value = '';
	base64.value = '';

	await service.base.open
		.captcha({
			height: 45,
			width: 150,
			color: '#C9A84C'
		})
		.then(({ captchaId, data }) => {
			if (data) {
				if (data.includes(';base64,')) {
					base64.value = data;
				} else {
					svg.value = data;
				}

				emit('update:modelValue', captchaId);
				emit('change', {
					base64,
					svg,
					captchaId
				});
			} else {
				ElMessageBox.alert(t('验证码获取失败'), {
					title: t('提示'),
					type: 'error'
				});
			}
		})
		.catch(err => {
			ElMessageBox.alert(err.message, {
				title: t('提示'),
				type: 'error'
			});
		});
}

onMounted(() => {
	refresh();
});

defineExpose({
	refresh
});
</script>

<style lang="scss" scoped>
.pic-captcha {
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	height: 42px;
	width: 120px;
	position: relative;
	user-select: none;
	border-radius: 8px;
	overflow: hidden;
	background: rgba(201, 168, 76, 0.08);
	border: 1px solid rgba(201, 168, 76, 0.2);
	transition: border-color 0.2s, opacity 0.2s;

	&:hover {
		border-color: rgba(201, 168, 76, 0.4);
		opacity: 0.9;
	}

	.svg {
		height: 100%;
		width: 100%;
		position: relative;

		:deep(svg) {
			height: 100%;
			width: 100%;
		}
	}

	.base64 {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	.is-loading {
		color: rgba(201, 168, 76, 0.6);
	}
}
</style>
