<template>
	<view class="container">
		<view class="bglogin">
			<img src="https://static.vecteezy.com/system/resources/previews/006/046/341/original/barbershop-logo-vintage-classic-style-salon-fashion-haircut-pomade-badge-icon-simple-minimalist-modern-barber-pole-razor-shave-scissor-razor-blade-retro-symbol-luxury-elegant-design-free-vector.jpg"
				alt="" />
		</view>
		<view class="content">
			<view class="title">修改密码</view>
			<view class="welcome-text">欢迎使用</view>

			<view class="userlogin">
				<view class="uni-form-item uni-column">
					<input class="uni-input" type="number" v-model="userName" placeholder="请输入手机号" />
					<input class="uni-input" type="email" v-model="email" placeholder="请输入邮箱" />
					<input class="uni-input" password type="text" v-model="password" placeholder="请输入新密码" />
					<view class="code-input-container">
						<input class="uni-input code-input" type="number" v-model="code" placeholder="请输入验证码" />
						<button class="code-btn" :disabled="countdown > 0" @click="sendcode">
							{{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
						</button>
					</view>
				</view>
				<button class="login-btn" @click="updatePassword">修改</button>
			</view>
		</view>

		<text class="tips">小程序由GJdot制作</text>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				userName: '',
				email: '',
				password: '',
				code: '',
				countdown: 0,
				timer: null
			};
		},
		beforeDestroy() {
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		methods: {
			startCountdown() {
				this.countdown = 60;
				this.timer = setInterval(() => {
					if (this.countdown > 0) {
						this.countdown--;
					} else {
						clearInterval(this.timer);
					}
				}, 1000);
			},

			async sendcode() {
				if (!this.validateEmail()) {
					return;
				}

				try {
					const result = await uni.request({
						url: `http://localhost:8080/user/sendcode?email=${encodeURIComponent(this.email)}`,
						method: 'GET'
					});

					if (result.statusCode === 200 && result.data.code === 200) {
						uni.showToast({
							title: '验证码已发送',
							icon: 'success'
						});
						this.startCountdown();
					} else {
						uni.showToast({
							title: result.data.message || '发送失败',
							icon: 'error'
						});
					}
				} catch (err) {
					console.error('发送验证码错误:', err);
					uni.showToast({
						title: '发送失败',
						icon: 'error'
					});
				}
			},

			validateUserName() {
				const userNameRegex = /^1[3-9]\d{9}$/;
				if (!userNameRegex.test(this.userName)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			validatePassword() {
				if (this.password.length < 6) {
					uni.showToast({
						title: '密码长度不能少于6位',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			validateEmail() {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(this.email)) {
					uni.showToast({
						title: '请输入正确的邮箱格式',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			validateCode() {
				if (!this.code || this.code.length !== 6) {
					uni.showToast({
						title: '请输入正确的验证码',
						icon: 'none'
					});
					return false;
				}
				return true;
			},
			async verifyCode() {
				try {
					const result = await uni.request({
						url: `http://localhost:8080/user/verifycode`,
						method: 'POST',
						header: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						data: `email=${encodeURIComponent(this.email)}&code=${encodeURIComponent(this.code)}`
					});
					if (result.statusCode === 200) {
						return result.data.code === 200;
					} else {
						uni.showToast({
							title: result.data.message || '验证失败',
							icon: 'none'
						});
						return false;
					}
				} catch (err) {
					console.error('验证码校验错误:', err);
					uni.showToast({
						title: '验证码校验失败',
						icon: 'error'
					});
					return false;
				}
			},

			async updatePassword() {
				if (!this.validateUserName() || !this.validatePassword() ||
					!this.validateEmail() || !this.validateCode()) {
					return;
				}

				const isCodeValid = await this.verifyCode();
				if (!isCodeValid) {
					uni.showToast({
						title: '验证码无效或已过期',
						icon: 'none'
					});
					return;
				}

				try {
					const checkUserResult = await uni.request({
						url: `http://localhost:8080/user/username/${this.userName}`,
						method: 'GET'
					});

					if (checkUserResult.data.code !== 200) {
						uni.showToast({
							title: '用户不存在',
							icon: 'error'
						});
						return;
					}

					const updateResult = await uni.request({
						url: 'http://localhost:8080/user/updatePassword',
						method: 'PUT',
						data: {
							userName: this.userName,
							email: this.email,
							password: this.password
						}
					});

					const updateRes = updateResult.data;

					if (updateRes.code === 200) {
						uni.showToast({
							title: '密码修改成功',
							icon: 'success'
						});
						// setTimeout(() => {
						// 	uni.navigateTo({
						// 		url:"/pages/login/login"
						// 	})
						// }, 1500);
					} else {
						uni.showToast({
							title: updateRes.message || '修改失败',
							icon: 'error'
						});
					}
				} catch (err) {
					console.error('操作失败:', err);
					uni.showToast({
						title: '操作失败',
						icon: 'error'
					});
				}
			}


		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		background: #f8f9fa;

		.bglogin {
			width: 100%;
			height: 40vh;
			overflow: hidden;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		.content {
			flex: 1;
			padding: 40rpx;
			margin-top: -50rpx;
			position: relative;
			z-index: 1;
			background: linear-gradient(180deg, transparent 0%, #f8f9fa 20%);

			text {
				color: #3B82F6;
			}

			.userlogin {
				margin-top: -20rpx;
				text-align: center;

				.uni-form-item {
					margin-bottom: 30rpx;
					padding: 0 40rpx;

					.uni-input {
						height: 90rpx;
						border: 1rpx solid #e5e5e5;
						border-radius: 45rpx;
						padding: 0 40rpx;
						font-size: 28rpx;
						background: #fff;
						margin-bottom: 20rpx;

						&:last-child {
							margin-bottom: 0;
						}
					}
				}




			}
		}

		.title {
			font-size: 48rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 10rpx;
			text-align: center;
		}

		.welcome-text {
			font-size: 28rpx;
			color: #666;
			text-align: center;
			margin-bottom: 40rpx;
		}

		.login-btn {
			width: 80%;
			height: 90rpx;
			background: linear-gradient(135deg, #4CAF50, #45a049);
			border-radius: 45rpx;
			font-size: 32rpx;
			color: white;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 20rpx auto 0;
			border: none;
			box-shadow: 0 6rpx 16rpx rgba(76, 175, 80, 0.3);
			transition: all 0.3s ease;

			&.button-hover {
				transform: translateY(2rpx);
				box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.2);
			}
		}

		.user-info {
			padding: 40rpx;
			text-align: center;

			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 60rpx;
				background: #4CAF50;
				margin: 0 auto 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.avatar-placeholder {
					color: white;
					font-size: 48rpx;
					font-weight: 600;
				}
			}

			.welcome-back {
				font-size: 32rpx;
				color: #333;
				margin-bottom: 10rpx;
			}

			.user-id {
				font-size: 24rpx;
				color: #666;
			}
		}

		.tips {
			font-size: 24rpx;
			color: #999;
			text-align: center;
			padding: 20rpx 0;
			position: absolute;
			bottom: 40rpx;
			width: 100%;
		}
	}
</style>