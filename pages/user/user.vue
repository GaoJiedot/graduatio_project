<template>
	<view class="container">
		<!-- 用户信息盒子 -->
		<view class="uersbox">
			<!-- 用户信息 -->
			<view class="user-info-box">
				<view class="user-info">
					<!-- 用户头像 -->
					<image class="avatar" :src="data.userAvatar" />
					<!-- 用户详情 -->
					<view class="user-details">
						<!-- 用户名 -->
						<text class="username">{{data.userName}}</text>
						<!-- 用户ID -->
						<text class="user-id">ID:{{data.userId}}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 其他选项 -->
		<view class="otherbox">
			<!-- 个人信息 -->
			<view class="other" @click="account">
				个人信息
			</view>
			<!-- 免责条款 -->
			<view class="other" @click="disclaimer">
				免责条款
			</view>
			<!-- 申请成为商家 -->
				<view class="other" @click="apply" v-if="data.userType==2">
					申请成为商家
				</view>
		</view>
		<button class="exitbtn" @click="eixtbtns">退出登录</button>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				data: {},
			};
		},
		methods: {
			eixtbtns() {
				uni.removeStorage({
					key: 'userInfo',
					success: (res) => {
						console.log('success');
					}
				});

				uni.navigateTo({
					url: "/pages/login/login"
				});
			},
			account() {
				uni.navigateTo({
					url: "/pages/account/account"
				});
			},
			disclaimer() {
				uni.showModal({
					title: '免责条款',
					content: '本平台提供的信息仅供参考，不构成任何投资建议。用户在使用本平台时，应自行判断并承担相应的风险。本平台不对任何因使用本平台信息而导致的直接或间接损失承担责任。',
					showCancel: false,
					confirmText: '确定'
				})
			},
			apply() {
				uni.navigateTo({
					url: `/pages/apply/apply?userId=${this.data.userId}`
				});
			}
		},
		onLoad() {
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.data = res.data;
				}
			});
		},
		onShow() {
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.data = res.data;
					console.log("获取到的数据:", this.data);
				}
			});
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f2f2f2;
		min-height: 100vh;

		.uersbox {
			display: flex;
			align-items: center;
			background-color: #28aff6;
			height: 300rpx;
		}

		.user-info {
			display: flex;
			align-items: center;
			margin-top: 340rpx;
			padding: 20px;
		}

		.avatar {
			width: 80px;
			height: 80px;
			border-radius: 50%;
			margin-right: 15px;
		}

		.user-details {
			flex: 1;

			.username {
				font-size: 20px;
				color: #333333;
			}

			.user-id {
				font-size: 16px;
				color: #999999;
				margin-left: 15rpx;
			}
		}

		.otherbox {
			margin-top: 150rpx;

			.other {
				padding: 30rpx 30rpx;
				margin-top: 10rpx;
				background-color: #fff;
			}
		}

		.exitbtn {
			color: red;
			width: 80%;
			margin-top: 200rpx;
			border: 1px solid red;
		}
	}
</style>