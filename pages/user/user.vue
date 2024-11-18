<template>
	<view class="container">
		<!-- 用户信息盒子 -->
		<view class="uersbox">
			<!-- 用户信息 -->
			<view class="user-info-box">
				<view class="user-info">
					<!-- 用户头像 -->
					<image class="avatar" src="/static/logo.png" />
					<!-- 用户详情 -->
					<view class="user-details">
						<text class="username">{{data.userName}}</text>
						<text class="user-id">ID:{{data.userId}}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 其他功能 -->
		<view class="otherbox">
			<view v-for="(item, index) in func" :key="index" class="other" @click="handleItemClick(index)">
				{{item}}
			</view>

		</view>
		<!-- 退出登录按钮 -->
		<button class="exitbtn" @click="eixtbtns">退出登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				data:{
					email: "",
					password: "",
					userAccount: null,
					userId:null,
					userType: null,
					userName: ""
				},
				func: ["个人信息", "免责条款"]
			};
		},
		methods: {
			// 退出登录方法
			eixtbtns() {
				uni.removeStorage({
					key: 'userInfo',
					success: (res)=> {
						console.log('success');
					}
				});

				uni.navigateTo({
					url: "/pages/login/login"
				});
			},
			// 处理点击不同的功能项
			handleItemClick(index) {
				switch (index) {
					case 0:
						// 跳转到账号信息页面
						uni.navigateTo({
							url: "/pages/account/account"
						});
						break;
					case 1:
						uni.showModal({
							title: '免责条款',
							content: '乙方xx提醒甲方注意密码的保密。任何使用甲方密码进行的委托均视为有效的甲方委托。甲方自行承担由于其密码失密造成的损失。甲方如果遗失证券账户卡、 身份证明等证件， 应立即向乙方及其他相关机构挂失。 由于甲方未及时挂失而导致其遭受损失的， 由甲方自行承担， 乙方不承担任何责任。甲方通过私下协商达成的转让意向因对方不申报成交确认委托或申报不匹配的成交确认委托， 无法成交的， 乙方对此不承担责任。',
							showCancel: false,
							success: function(res) {
								if (res.confirm) {
									console.log('用户点击确定');
								} else if (res.cancel) {
									console.log('用户点击取消');
								}
							}
						});

						break;
					case 2:
						// 实现其他功能2的效果
						console.log("功能1点击");

						break;
					case 3:
						console.log("功能2点击");
						break;
					default:
						console.log("未知功能");
						break;
				}
			}
		},
		onLoad() {
			uni.getStorage({
				key: 'userInfo',
				success: (res) =>{
					this.data=res.data;
					console.log("获取到的数据:",this.data);
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
			background-color: #b7f4ed;
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