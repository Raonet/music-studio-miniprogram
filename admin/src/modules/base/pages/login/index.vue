<template>
	<div class="page-login">
		<!-- 星空粒子 -->
		<div class="stars" aria-hidden="true">
			<div v-for="i in 80" :key="i" class="star" :style="starStyle(i)" />
		</div>

		<!-- 太空装饰层 -->
		<div class="space-deco" aria-hidden="true">
			<!-- 底部多层静态椭圆星环 -->
			<svg class="bottom-rings" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="ringFade" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%"   stop-color="rgba(201,168,76,0)" />
						<stop offset="20%"  stop-color="rgba(201,168,76,0.6)" />
						<stop offset="50%"  stop-color="rgba(255,220,120,0.9)" />
						<stop offset="80%"  stop-color="rgba(201,168,76,0.6)" />
						<stop offset="100%" stop-color="rgba(201,168,76,0)" />
					</linearGradient>
					<linearGradient id="ringFade2" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%"   stop-color="rgba(201,168,76,0)" />
						<stop offset="25%"  stop-color="rgba(201,168,76,0.35)" />
						<stop offset="50%"  stop-color="rgba(201,168,76,0.5)" />
						<stop offset="75%"  stop-color="rgba(201,168,76,0.35)" />
						<stop offset="100%" stop-color="rgba(201,168,76,0)" />
					</linearGradient>
					<linearGradient id="ringFade3" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%"   stop-color="rgba(201,168,76,0)" />
						<stop offset="30%"  stop-color="rgba(201,168,76,0.18)" />
						<stop offset="50%"  stop-color="rgba(201,168,76,0.28)" />
						<stop offset="70%"  stop-color="rgba(201,168,76,0.18)" />
						<stop offset="100%" stop-color="rgba(201,168,76,0)" />
					</linearGradient>
				</defs>
				<!-- 最内层：最亮 -->
				<ellipse cx="600" cy="400" rx="280" ry="55" fill="none" stroke="url(#ringFade)" stroke-width="1.2" />
				<!-- 第二层 -->
				<ellipse cx="600" cy="400" rx="420" ry="85" fill="none" stroke="url(#ringFade2)" stroke-width="1" />
				<!-- 第三层 -->
				<ellipse cx="600" cy="400" rx="560" ry="115" fill="none" stroke="url(#ringFade3)" stroke-width="0.8" />
				<!-- 第四层：最外最淡 -->
				<ellipse cx="600" cy="400" rx="700" ry="145" fill="none" stroke="rgba(201,168,76,0.1)" stroke-width="0.6" />
				<!-- 虚线装饰层 -->
				<ellipse cx="600" cy="400" rx="350" ry="68" fill="none" stroke="rgba(201,168,76,0.12)" stroke-width="0.6" stroke-dasharray="6 12" />
			</svg>

			<!-- 大轨道圆环（SVG） -->
			<svg class="orbit-svg orbit-svg-1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="350" cy="350" rx="340" ry="120" fill="none" stroke="rgba(201,168,76,0.1)" stroke-width="1" />
				<ellipse cx="350" cy="350" rx="240" ry="80" fill="none" stroke="rgba(201,168,76,0.07)" stroke-width="1" stroke-dasharray="4 8" />
			</svg>
			<svg class="orbit-svg orbit-svg-2" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="250" cy="250" rx="240" ry="90" fill="none" stroke="rgba(201,168,76,0.08)" stroke-width="1" />
			</svg>
			<!-- 浮动光点群 -->
			<div class="float-dot fd-1" />
			<div class="float-dot fd-2" />
			<div class="float-dot fd-3" />
			<div class="float-dot fd-4" />
			<div class="float-dot fd-5" />
			<!-- 星云光晕 -->
			<div class="nebula nebula-1" />
			<div class="nebula nebula-2" />
			<!-- 网格线 -->
			<div class="grid-lines" />
		</div>

		<!-- 光晕装饰球 -->
		<div class="orb orb-1" aria-hidden="true" />
		<div class="orb orb-2" aria-hidden="true" />

		<!-- 登录卡片 -->
		<div class="box">
			<div class="box-glow" aria-hidden="true" />

			<div class="logo">
				<div class="icon">
					<img src="/logo.png" alt="Logo" />
				</div>
				<div class="logo-text">
					<span class="logo-name">{{ app.info.name }}</span>
					<span class="logo-sub">管理后台</span>
				</div>
			</div>

			<div class="divider" aria-hidden="true" />

			<div class="form">
				<el-form label-position="top" :disabled="saving">
					<el-form-item :label="$t('用户名')">
						<el-input v-model="form.username" :placeholder="$t('请输入用户名')" maxlength="20" />
					</el-form-item>

					<el-form-item :label="$t('密码')">
						<el-input v-model="form.password" type="password" :placeholder="$t('请输入密码')" maxlength="20" show-password autocomplete="new-password" />
					</el-form-item>

					<el-form-item :label="$t('验证码')">
						<el-input v-model="form.verifyCode" :placeholder="$t('验证码')" maxlength="4" @keyup.enter="toLogin">
							<template #suffix>
								<pic-captcha :ref="setRefs('picCaptcha')" v-model="form.captchaId" @change="() => { form.verifyCode = ''; }" />
							</template>
						</el-input>
					</el-form-item>

					<div class="op">
						<el-button type="primary" :loading="saving" @click="toLogin">{{ $t('登录') }}</el-button>
					</div>
				</el-form>
			</div>
		</div>

		<a href="https://beian.miit.gov.cn" target="_blank" class="copyright">晋ICP备2026005412号</a>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'login'
});

import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { storage } from '/@/cool/utils';
import { useI18n } from 'vue-i18n';
import PicCaptcha from './components/pic-captcha.vue';

const { refs, setRefs, router, service } = useCool();
const { user, app } = useBase();
const { t } = useI18n();

// 状态
const saving = ref(false);

// 表单数据
const form = reactive({
	username: storage.get('username') || '',
	password: '',
	captchaId: '',
	verifyCode: ''
});

// 演示模式
if (import.meta.env.MODE == 'demo') {
	form.username = 'admin';
	form.password = '123456';
}

// 登录
async function toLogin() {
	if (!form.username) {
		return ElMessage.error(t('用户名不能为空'));
	}

	if (!form.password) {
		return ElMessage.error(t('密码不能为空'));
	}

	if (!form.verifyCode) {
		return ElMessage.error(t('图片验证码不能为空'));
	}

	saving.value = true;

	try {
		// 登录
		await service.base.open.login(form).then(user.setToken);

		// token 事件
		await Promise.all(app.events.hasToken.map(e => e()));

		// 设置缓存
		storage.set('username', form.username);

		// 跳转首页
		router.push('/');
	} catch (err) {
		// 刷新验证码
		refs.picCaptcha.refresh();

		// 提示错误
		ElMessageBox.alert((err as Error).message, {
			title: t('提示'),
			type: 'error'
		});
	}

	saving.value = false;
}

// 星星随机样式
function starStyle(i: number) {
	const seed = i * 137.508;
	const x = (seed * 0.618033) % 100;
	const y = (seed * 0.381966) % 100;
	const size = i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1;
	const delay = (i * 0.23) % 5;
	const dur = 2 + (i % 4);
	const opacity = 0.2 + (i % 5) * 0.1;
	return {
		left: `${x}%`, top: `${y}%`,
		width: `${size}px`, height: `${size}px`,
		animationDelay: `${delay}s`, animationDuration: `${dur}s`,
		opacity,
	};
}
</script>

<style lang="scss" scoped>
.page-login {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	position: relative;
	background: radial-gradient(ellipse at 20% 50%, #1a1510 0%, #0e0d14 40%, #080710 100%);
	overflow: hidden;

	.copyright {
		position: absolute;
		bottom: 16px;
		left: 0;
		text-align: center;
		width: 100%;
		color: rgba(168, 159, 140, 0.4);
		font-size: 12px;
		user-select: none;
		text-decoration: none;
		transition: color 0.2s;
		z-index: 2;

		&:hover { color: rgba(201, 168, 76, 0.5); }
	}
}

// ── 星星 ──
.stars { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

.star {
	position: absolute;
	border-radius: 50%;
	background: #C9A84C;
	animation: twinkle ease-in-out infinite;
}

@keyframes twinkle {
	0%, 100% { opacity: 0.08; transform: scale(1); }
	50% { opacity: 0.7; transform: scale(1.8); }
}

// ── 太空装饰层 ──
.space-deco {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 0;
}

// 底部多层静态椭圆星环
.bottom-rings {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 100%;
	max-width: 1200px;
	height: 400px;
	pointer-events: none;
	z-index: 1;
}

// 轨道圆环 SVG
.orbit-svg {
	position: absolute;
	pointer-events: none;
}

.orbit-svg-1 {
	width: 700px;
	height: 700px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) rotateX(65deg);
	opacity: 0.8;
}

.orbit-svg-2 {
	width: 500px;
	height: 500px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) rotateX(65deg) rotate(40deg);
	opacity: 0.7;
}

// 浮动光点群（散落的金色发光粒子）
.float-dot {
	position: absolute;
	border-radius: 50%;
	background: #C9A84C;
	animation: dot-float ease-in-out infinite;
}

.fd-1 { width: 4px;  height: 4px;  top: 22%;  left: 12%;  box-shadow: 0 0 10px 3px rgba(201,168,76,0.5); animation-duration: 7s;  animation-delay: 0s; }
.fd-2 { width: 3px;  height: 3px;  top: 68%;  left: 78%;  box-shadow: 0 0 8px 2px rgba(201,168,76,0.4);  animation-duration: 9s;  animation-delay: 1.5s; }
.fd-3 { width: 5px;  height: 5px;  top: 40%;  left: 88%;  box-shadow: 0 0 14px 4px rgba(201,168,76,0.45); animation-duration: 11s; animation-delay: 3s; }
.fd-4 { width: 3px;  height: 3px;  top: 80%;  left: 25%;  box-shadow: 0 0 8px 2px rgba(201,168,76,0.35); animation-duration: 8s;  animation-delay: 2s; }
.fd-5 { width: 6px;  height: 6px;  top: 15%;  left: 60%;  box-shadow: 0 0 16px 5px rgba(201,168,76,0.4); animation-duration: 13s; animation-delay: 4s; }

@keyframes dot-float {
	0%, 100% { transform: translateY(0) scale(1);   opacity: 0.6; }
	33%       { transform: translateY(-18px) scale(1.2); opacity: 1; }
	66%       { transform: translateY(10px) scale(0.9);  opacity: 0.4; }
}

// 星云光晕
.nebula {
	position: absolute;
	border-radius: 50%;
	filter: blur(80px);
	pointer-events: none;
}

.nebula-1 {
	width: 500px;
	height: 300px;
	top: -80px;
	right: -100px;
	background: radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, rgba(139,105,20,0.04) 50%, transparent 70%);
	animation: nebula-pulse 12s ease-in-out infinite;
}

.nebula-2 {
	width: 400px;
	height: 250px;
	bottom: -60px;
	left: -80px;
	background: radial-gradient(ellipse, rgba(139,105,20,0.06) 0%, rgba(201,168,76,0.03) 50%, transparent 70%);
	animation: nebula-pulse 15s ease-in-out infinite reverse;
}

@keyframes nebula-pulse {
	0%, 100% { opacity: 0.6; transform: scale(1); }
	50%       { opacity: 1;   transform: scale(1.1); }
}

// 透视网格线
.grid-lines {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
		linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px);
	background-size: 60px 60px;
	mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%);
}

// ── 光晕球 ──
.orb {
	position: absolute;
	border-radius: 50%;
	pointer-events: none;
	z-index: 0;
	filter: blur(70px);
}

.orb-1 {
	width: 450px;
	height: 450px;
	background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
	top: -120px;
	right: -120px;
	animation: float 9s ease-in-out infinite;
}

.orb-2 {
	width: 350px;
	height: 350px;
	background: radial-gradient(circle, rgba(139,105,20,0.05) 0%, transparent 70%);
	bottom: -100px;
	left: -100px;
	animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
	0%, 100% { transform: translate(0, 0); }
	50%       { transform: translate(24px, -24px); }
}

// ── 登录卡片 ──
.box {
	position: relative;
	z-index: 2;
	width: 400px;
	padding: 44px 40px 40px;
	background: rgba(255, 255, 255, 0.035);
	backdrop-filter: blur(24px) saturate(1.5);
	-webkit-backdrop-filter: blur(24px) saturate(1.5);
	border: 1px solid rgba(201, 168, 76, 0.2);
	border-radius: 24px;
	box-shadow:
		0 32px 80px rgba(0, 0, 0, 0.6),
		0 0 0 1px rgba(201, 168, 76, 0.06),
		inset 0 1px 0 rgba(201, 168, 76, 0.15);
}

.box-glow {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 60%;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent);
	border-radius: 1px;
}

// ── Logo ──
.logo {
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	user-select: none;

	.icon {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		background: linear-gradient(135deg, rgba(201,168,76,0.25), rgba(139,105,20,0.15));
		border: 1px solid rgba(201, 168, 76, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 14px;
		box-shadow: 0 4px 16px rgba(201, 168, 76, 0.15);
		flex-shrink: 0;

		img { height: 30px; width: 30px; }
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.logo-name {
		font-size: 22px;
		font-weight: 800;
		letter-spacing: 1.5px;
		background: linear-gradient(135deg, #F0EDE6 0%, #C9A84C 60%, #E2C07A 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.2;
	}

	.logo-sub {
		font-size: 11px;
		color: rgba(168, 159, 140, 0.6);
		letter-spacing: 2px;
	}
}

.divider {
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
	margin: 20px 0 24px;
}

// ── 表单 ──
.form {
	width: 100%;

	:deep(.el-form-item) { margin-bottom: 18px; }

	:deep(.el-form-item__label) {
		color: #A89F8C !important;
		font-size: 12px !important;
		font-weight: 500;
		letter-spacing: 0.5px;
		padding-left: 2px;
		user-select: none;
	}

	:deep(.el-input__wrapper) {
		background-color: rgba(201, 168, 76, 0.05) !important;
		box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.15) inset !important;
		border-radius: 10px !important;
		transition: box-shadow 0.2s !important;

		&:hover { box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.3) inset !important; }
		&.is-focus { box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.5) inset, 0 0 0 3px rgba(201, 168, 76, 0.1) !important; }
	}

	:deep(.el-input__inner) {
		height: 42px !important;
		color: #F0EDE6 !important;
		font-size: 14px !important;

		&::placeholder { color: rgba(168, 159, 140, 0.45) !important; }
	}

	:deep(.pic-captcha) {
		position: absolute;
		right: -5px;
		top: 0;
	}
}

.op {
	margin-top: 28px;

	:deep(.el-button) {
		height: 46px !important;
		width: 100% !important;
		font-size: 15px !important;
		font-weight: 700 !important;
		border-radius: 12px !important;
		letter-spacing: 3px !important;
		background: linear-gradient(135deg, #C9A84C 0%, #8B6914 100%) !important;
		border: none !important;
		color: #0e0d14 !important;
		box-shadow: 0 4px 20px rgba(201, 168, 76, 0.35) !important;
		transition: all 0.2s ease !important;

		&:hover {
			transform: translateY(-2px) !important;
			box-shadow: 0 8px 28px rgba(201, 168, 76, 0.45) !important;
			background: linear-gradient(135deg, #E2C07A 0%, #C9A84C 100%) !important;
		}

		&:active {
			transform: translateY(0) !important;
			box-shadow: 0 2px 10px rgba(201, 168, 76, 0.25) !important;
		}
	}
}

// ── 无障碍：减少动效 ──
@media (prefers-reduced-motion: reduce) {
	.star, .ring-svg, .float-dot, .scan-line, .nebula, .orb { animation: none !important; }
}

@media screen and (max-width: 480px) {
	.box { width: 92%; padding: 36px 24px 32px; }
	.ring-wrap-1 { width: 200px; height: 200px; }
	.ring-wrap-2 { width: 140px; height: 140px; }
}
</style>
