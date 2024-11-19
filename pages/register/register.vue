<template>
	<view class="container">
		<view class="bglogin"><img src="static/ResourceFiles/bg1.jpg" alt="" /></view>
		<view class="content">
			<view class="title">用户注册</view>
			<view class="welcome-text">欢迎使用</view>

			<view class="userlogin">
				<view class="uni-form-item uni-column">
					<input class="uni-input" type="number" v-model="userAccount" placeholder="请输入手机号" />
					<input class="uni-input" password type="text" v-model="password" placeholder="请输入密码" />
					<input class="uni-input" type="email" v-model="email" placeholder="请输入邮箱" />
				</view>

				<button class="login-btn" @click="register">注册</button>
			</view>
		</view>

		<text class="tips">小程序由GJdot制作</text>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				userAccount: '',
				password: '',
				email: '',
				userAvatar: 'http://localhost:8080/avatar/1_edaf677a-d5bc-4be1-a3d3-79c2c5ea6963_avatars-23.png',

			};
		},
		methods: {
			generateRandomUserName() {
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				let randomName = '';
				for (let i = 0; i < 8; i++) { // 生成8位长度的随机字符串
					randomName += chars.charAt(Math.floor(Math.random() * chars.length));
				}
				return randomName;
			},
			validateUserAccount() {
				const userAccountRegex = /^1[3-9]\d{9}$/;
				if (!userAccountRegex.test(this.userAccount)) {
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

			register() {

				if (!this.validateUserAccount() || !this.validatePassword() || !this.validateEmail()) {
					return;
				}

				uni.showLoading({
					title: '处理中...'
				});


				uni.request({
					url: `http://localhost:8080/user/userAccount/${this.userAccount}`,
					method: 'GET',

					success: (res) => {
						console.log(res.data)
						if (res.data.code === 200) {
							uni.showToast({
								title: '账号已存在',
								icon: 'none',

							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								});
							}, 2000);

						} else if (res.data.code === 500) {
							const randomUserName = this.generateRandomUserName();
							uni.request({
								url: 'http://localhost:8080/user',
								method: 'POST',
								data: {
									userAccount: this.userAccount,
									password: this.password,
									email: this.email,
									userAvatar: this.userAvatar,
									userName: randomUserName, 
									userType:2
								},
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '注册成功',
											icon: 'success'
										});
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
										}, 2000);
									} else {
										uni.showToast({
											title: res.data.message || '注册失败',
											icon: 'none'
										});
									}
								},
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '注册成功',
											icon: 'success'
										});
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
										}, 2000);
									} else {
										uni.showToast({
											title: res.data.message || '注册失败',
											icon: 'none'
										});
									}
								},
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '注册成功',
											icon: 'success'
										});
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
										}, 2000);
									} else {
										uni.showToast({
											title: res.data.message || '注册失败',
											icon: 'none'
										});
									}

								},
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '注册成功',
											icon: 'success'
										});
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
										}, 2000);
									} else {
										uni.showToast({
											title: res.data.message || '注册失败',
											icon: 'none'
										});
									}
								},
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '注册成功',
											icon: 'success'
										});
										setTimeout(() => {
											uni.navigateBack({
												delta: 1
											});
										}, 2000);
									} else {
										uni.showToast({
											title: res.data.message || '注册失败',
											icon: 'none'
										});
									}
								},
								fail: () => {
									uni.showToast({
										title: '网络错误，请稍后重试',
										icon: 'none'
									});
								},
								complete: () => {
									uni.hideLoading();

								}
							});
						} else {
							uni.showToast({
								title: res.data.message || '查询失败',
								icon: 'none'
							});
						}
					},
					fail: () => {
						uni.showToast({
							title: '网络错误，请稍后重试',
							icon: 'none'
						});
					},
					complete: () => {
						uni.hideLoading();

					}
				});
			}


		}
	};
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

				.forget {
					margin-right: 80rpx;
					color: #3B82F6;

				}

				.register {
					color: #3B82F6;
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