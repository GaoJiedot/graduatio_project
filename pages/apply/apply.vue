<template>
	<view class="edit-shop-container">
		<view class="nav-header">
			<text class="page-title">申请店铺信息填写:</text>
		</view>

		<view class="edit-form">
			<view class="form-item">
				<text class="label">店铺名称:</text>
				<input class="input-field" v-model="shopInfo.shopName" placeholder="请输入店铺名称" />
			</view>
			<view class="form-item">
				<text class="label">联系电话:</text>
				<input class="input-field" v-model="shopInfo.shopPhone" type="number" placeholder="请输入联系电话" />
			</view>

			<view class="form-item">
				<text class="label">申请人真实姓名:</text>
				<input class="input-field" v-model="shopInfo.shopKeeper" placeholder="请输入详细地址" />
			</view>
		</view>
		<view class="submit-btn" @click="saveShopInfo">
			<text>提交</text>
		</view>
	</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userId: null,
				shopInfo: {
					shopName: '',
					shopPhone: null,
					shopKeeper: ''
				}
			}
		},
		methods: {
			saveShopInfo() {
				if (!this.validateForm()) {
					return;
				}

				uni.request({
					url: `http://localhost:8080/shop`,
					method: 'POST',
					data: {
						userId: this.userId,
						shopName: this.shopInfo.shopName,
						shopPhone: this.shopInfo.shopPhone,
						shopKeeper: this.shopInfo.shopKeeper,
						applyStatus: 1
					},
					success: (res) => {
						if (res.data.code == 200) {
							uni.showToast({
								title: '申请成功',
								icon: 'success'
							});
							uni.reLaunch({
								url: '/pages/user/user'
							})
						} else {
							uni.showToast({
								title: '申请失败',
								icon: 'none'
							});

						}
					},
					fail: (err) => {
						uni.showToast({
							title: '网络错误',
							icon: 'none'
						});
					}
				})
			},

			validateForm() {
				const {
					shopName,
					shopPhone,
					shopAddress
				} = this.shopInfo;

				if (!shopName) {
					uni.showToast({
						title: '请输入店铺名称',
						icon: 'none'
					});
					return false;
				}

				if (!shopPhone || !/^1[3-9]\d{9}$/.test(shopPhone)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return false;
				}

				if (!shopAddress) {
					uni.showToast({
						title: '请输入店铺地址',
						icon: 'none'
					});
					return false;
				}

				return true;
			}
		},
		onLoad(options) {
			this.userId = options.userId
		}
	}
</script>
<style lang="scss" scoped>
	.edit-shop-container {
		min-height: 100vh;
		padding: 30rpx;
		margin-right: 40rpx;

		.submit-btn {
			position: fixed;
			bottom: 50rpx;
			left: 30rpx;
			right: 30rpx;
			height: 90rpx;
			background-color: #4CAF50;
			color: white;
			border-radius: 45rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 32rpx;
			font-weight: bold;
		}

		.nav-header {
			display: flex;
			align-items: center;
			margin-bottom: 40rpx;

			.back-icon {
				image {
					width: 50rpx;
					height: 50rpx;
				}
			}

			.page-title {
				font-size: 40rpx;
				font-weight: bold;
				margin-left: 20rpx;
			}

			.save-icon {
				margin-left: auto;
				color: #4CAF50;
				font-size: 32rpx;
			}
		}

		.edit-form {
			background-color: #fff;
			border-radius: 20rpx;
			align-items: center;
			justify-content: center;
			padding: 30rpx;
			margin-bottom: 100rpx;

			.form-item {
				margin-bottom: 30rpx;

				.label {
					display: block;
					font-size: 32rpx;
					color: #333;
					margin-bottom: 15rpx;
				}

				.input-field {
					width: 100%;
					height: 80rpx;
					border: 2rpx solid #ddd;
					border-radius: 10rpx;
					padding: 0 20rpx;
					font-size: 28rpx;
				}

				.textarea-field {
					width: 100%;
					height: 200rpx;
					border: 2rpx solid #ddd;
					border-radius: 10rpx;
					padding: 20rpx;
					font-size: 28rpx;
				}

				.upload-logo {
					width: 200rpx;
					height: 200rpx;
					border: 2rpx dashed #ddd;
					border-radius: 10rpx;
					overflow: hidden;
					position: relative;

					image {
						width: 100%;
						height: 100%;
						border-radius: 10rpx;
						object-fit: cover;
					}

					.upload-tips {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						background: rgba(0, 0, 0, 0.5);
						color: white;
						font-size: 24rpx;
						text-align: center;
						padding: 10rpx 0;
					}
				}

				.upload-background {
					width: 100%;
					height: 400rpx;
					border: 2rpx dashed #ddd;
					border-radius: 10rpx;
					overflow: hidden;
					position: relative;

					image {
						width: 100%;
						height: 100%;
						border-radius: 10rpx;
						object-fit: cover;
					}

					.upload-tips {
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						background: rgba(0, 0, 0, 0.5);
						color: white;
						font-size: 24rpx;
						text-align: center;
						padding: 10rpx 0;
					}
				}
			}
		}
	}
</style>