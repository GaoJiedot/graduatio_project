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
			<button v-if="!userInfo" @click="login" type="primary" class="login-btn" hover-class="button-hover">
				微信一键登录
			</button>

			<!-- 如果有用户信息，显示用户信息 -->
			<view v-if="userInfo" class="user-info">
				<view class="avatar">
					<text class="avatar-placeholder">{{ userInfo.openid.charAt(0) }}</text>
				</view>
				<view class="welcome-back">欢迎回来</view>
				<view class="user-id">{{ userInfo.openid }}</view>
			</view>
		</view>
		<!-- 提示文本 -->
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
			// 页面加载时检查本地是否已存储用户信息
			checkUserStatus() {
				const storedUserInfo = uni.getStorageSync('userInfo');
				if (storedUserInfo) {
					// 已经登录过，直接跳转到其他页面
					this.userInfo = storedUserInfo;
					uni.switchTab({
						url:"/pages/index/index" // 替换为目标页面路径
					});
				} else {
					// 未登录，显示登录按钮
					this.userInfo = null;
				}
			},
			// 登录方法
			login() {
				uni.reLaunch({
					url:"/pages/index/index"
				})
				// uni.login({
				// 	provider: 'weixin', // 微信小程序登录
				// 	success: (loginRes) => {
				// 		console.log('获取到的 code:', loginRes.code);

				// 		// 发送 code 到后台换取 openid、session_key 等信息
				// 		uni.request({
				// 			url: 'http://localhost:3000/api/login', // 后端服务器地址
				// 			method: 'POST',
				// 			data: {
				// 				code: loginRes.code
				// 			},
				// 			success: (res) => {
				// 				if (res.data.success) {
				// 					console.log('登录成功，后台返回的数据:', res.data);
				// 					this.userInfo = res.data.userInfo; // 保存用户信息
				// 					uni.setStorageSync('userInfo', res.data
				// 					.userInfo); // 将用户信息保存到本地
				// 					uni.switchTab({
				// 						url: '/pages/home/home' // 登录成功后跳转到其他页面
				// 					});
				// 				} else {
				// 					console.log('登录失败:', res.data.message);
				// 				}
				// 			},
				// 			fail: (error) => {
				// 				console.log('请求失败', error);
				// 			}
				// 		});
				// 	},
				// 	fail: (error) => {
				// 		console.log('登录失败', error);
				// 	}
				// });
			}
		},
		onLoad() {
			// 页面加载时检查用户状态
			this.checkUserStatus();
		}
	};
</script>

<style lang="scss" scoped>
	.container {
	  min-height: 100vh;
	  display: flex;
	  flex-direction: column;
	  position: relative;
	
	  .bglogin {
	    width: 100%;
	    height: 60vh;
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
	    margin-top: -60rpx;
	    position: relative;
	    z-index: 1;
	    background: linear-gradient(180deg, transparent 0%, #f8f9fa 20%);
	  }
	
	  .title {
	    font-size: 48rpx;
	    font-weight: 600;
	    color: #333;
	    margin-bottom: 20rpx;
	    text-align: center;
	  }
	
	  .welcome-text {
	    font-size: 28rpx;
	    color: #666;
	    text-align: center;
	    margin-bottom: 60rpx;
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
	    margin: 0 auto;
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
	    display: block;
	    font-size: 24rpx;
	    color: #999;
	    text-align: center;
	    width: 100%;
	  }
	}
</style>