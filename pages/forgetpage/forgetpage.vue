<template>
	<view class="container">
		<!-- 背景图片 -->
		<view class="bglogin"><img src="/static/khl20240930232745242.png" alt="" /></view>
		<view class="content">
			<!-- 标题 -->
			<view class="title">用户登录</view>
			<!-- 欢迎文本 -->
			<view class="welcome-text">欢迎使用</view>

			<!-- 如果没有用户信息，显示登录按钮 -->
			<view v-if="!userInfo||loginstate===0" class="userlogin">
				<view class="uni-form-item uni-column">
					<input class="uni-input" type="number" placeholder="请输入手机号" />
					<input class="uni-input" password type="text" placeholder="请输入新密码" />
				</view>
				
				<button class="login-btn" @click="login">修改</button>
			</view>

	
			
		</view>
		
		<text class="tips">小程序由GJdot制作</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 用户信息
				userInfo: null
			};
		},
		methods: {
		
			// 登录方法
			login() {
				uni.navigateBack({
					url: "/pages/index/index"
				})
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
				.register{
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