<template>
	<view class="container">
		<view class="bglogin"><img src="static/ResourceFiles/bg1.jpg" alt="" /></view>
		<view class="content">

			<view class="title">用户登录</view>

			<view class="welcome-text">欢迎使用</view>

			<view v-if="!userInfo" class="userlogin">
				<view class="uni-form-item uni-column">
					<input class="uni-input" type="number" v-model="userAccount" placeholder="请输入手机号" />
					<input class="uni-input" password type="text" v-model="password" placeholder="请输入密码" />
				</view>
				<text class="forget" @click="forgetbtn">忘记密码</text>
				<text class="register" @click="registerbtn">注册账号</text>
				<button class="login-btn" @click="login">登录</button>
			</view>

			<view v-if="userInfo" class="user-info">
				<view class="avatar">
				<image class="avatar-placeholder" :src="userAvatar || '/static/icon/logo.png'" />
				</view>
				<view class="welcome-back">欢迎回来</view>
				<view class="user-id">{{ userInfo.userName }}</view>
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
				userInfo: null,
				userName: '',
				userAvatar: '',
				userId:null
			};
		},
		methods: {
			forgetbtn() {
				uni.navigateTo({
					url: "/pages/forgetpage/forgetpage"
				})
			},
			registerbtn() {
				uni.navigateTo({
					url: "/pages/register/register"
				})
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
			login() {
				if (!this.validateUserAccount() || !this.validatePassword()) {
					return;
				}

				uni.showLoading({
					title: '登录中...'
				});

				uni.request({
					url: `http://localhost:8080/user/userAccount/${this.userAccount}`,
					method: 'GET',
					data: {
						userAccount: this.userAccount,
						password: this.password
					},
					success: (res) => {
						console.log(res.data)
						if (res.data.code === 200 && res.data.data) {
							uni.request({
								url: `http://localhost:8080/user/login`,
								method: 'POST',
								data: {
									userAccount: this.userAccount,
									password: this.password
								},
								success: (res) => {
									console.log(res.data)
									if (res.data.code === 200 && res.data.data) {
										const userInfo = {
											...res.data.data,
											token: res.data.data.token,
											userName: res.data.data.userName,
											userAvatar: res.data.data.userAvatar,
											userId: res.data.data.userId,
											loginTime: new Date().getTime()
											
										};

										uni.removeStorageSync('userInfo');

										uni.setStorageSync('userInfo', userInfo);
										this.userInfo = userInfo;

										uni.showToast({
											title: '登录成功',
											icon: 'success'
										});

										setTimeout(() => {
											uni.switchTab({
												url: "/pages/index/index"
											});
										}, 1500);
									} else {
										uni.showToast({
											title: res.data.message,
											icon: 'none'
										});
									}
								},

							});

						} else {
							uni.showToast({
								title: res.data.message,
								icon: 'none'
							});
							uni.hideLoading();
						}
					},
					fail: (err) => {
						uni.showToast({
							title: '网络错误，请稍后重试',
							icon: 'none'
						});
						uni.hideLoading();
					}
				});
			},


			checkLoginStatus() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					const currentTime = new Date().getTime();
					const loginTime = userInfo.loginTime;

					if (currentTime - loginTime < 7 * 24 * 60 * 60 * 1000) {
						this.userInfo = userInfo;
						uni.switchTab({
							url: "/pages/index/index"
						});
					} else {
						uni.removeStorageSync('userInfo');
						this.userInfo = null;
					}
				}
			}
		},
		onLoad() {
			let token = uni.getStorageSync('token');
        
			this.checkLoginStatus();
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