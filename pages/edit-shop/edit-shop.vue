<template>
	<view class="edit-shop-container">
		<view class="nav-header">
			<text class="page-title">您的店铺信息:</text>
			<view class="save-icon" @click="saveShopInfo">
				<text>保存</text>
			</view>
		</view>

		<view class="edit-form">
			<!-- Logo上传 -->
			<view class="form-item">
				<text class="label">店铺Logo:</text>
				<view class="upload-logo" @click="chooseLogoImage">
					<image 
						:src="shopInfo.shopLogo || '/static/default-logo.png'" 
						mode="aspectFill"
					></image>
					<text class="upload-tips">点击上传Logo</text>
				</view>
			</view>

			<!-- 背景图上传 -->
			<view class="form-item">
				<text class="label">店铺背景:</text>
				<view class="upload-background" @click="chooseShopImages">
					<image 
						:src="shopInfo.ShopImages || '/static/default-background.png'" 
						mode="aspectFill"
					></image>
					<text class="upload-tips">点击上传背景</text>
				</view>
			</view>

			<!-- 原有表单项 -->
			<view class="form-item">
				<text class="label">店铺名称:</text>
				<input class="input-field" v-model="shopInfo.shopName" placeholder="请输入店铺名称" />
			</view>

			<view class="form-item">
				<text class="label">店铺描述:</text>
				<textarea 
					class="textarea-field" 
					v-model="shopInfo.shopDescription" 
					placeholder="简单介绍您的店铺" 
					maxlength="200"
				></textarea>
			</view>

			<view class="form-item">
				<text class="label">联系电话:</text>
				<input 
					class="input-field" 
					v-model="shopInfo.shopPhone" 
					type="number" 
					placeholder="请输入联系电话" 
				/>
			</view>

			<view class="form-item">
				<text class="label">营业时间:</text>
				<input 
					class="input-field" 
					v-model="shopInfo.shopBusinessHours" 
					placeholder="例如：09:00-22:00" 
				/>
			</view>

			<view class="form-item">
				<text class="label">店铺地址:</text>
				<input 
					class="input-field" 
					v-model="shopInfo.shopAddress" 
					placeholder="请输入详细地址" 
				/>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {},
			shopInfo: {
				shopLogo: '',
				shopImages: '',
				shopName: '',
				shopDescription: '',
				shopPhone: '',
				shopBusinessHours: '',
				shopAddress: ''
			},
			logoTempFilePath: '',
			backgroundTempFilePath: ''
		}
	},
	methods: {
		// 选择Logo图片
		chooseLogoImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.logoTempFilePath = res.tempFilePaths[0];
					this.shopInfo.shopLogo = this.logoTempFilePath;
				}
			});
		},

		// 选择背景图片
		chooseShopImages() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.backgroundTempFilePath = res.tempFilePaths[0];
					this.shopInfo.ShopImages = this.backgroundTempFilePath;
				}
			});
		},

		// Logo上传方法
		uploadLogo() {
			return new Promise((resolve, reject) => {
				if (!this.logoTempFilePath) {
					resolve(null);
					return;
				}

				uni.uploadFile({
					url: `http://localhost:8080/shop/uploadLogo`,
					filePath: this.logoTempFilePath,
					name: 'file',
					success: (res) => {
						try {
							const result = JSON.parse(res.data);
							if (result.code === 200) {
								resolve(result.data);
							} else {
								reject(new Error(result.message || 'Logo上传失败'));
							}
						} catch (e) {
							reject(e);
						}
					},
					fail: (err) => {
						reject(err);
					}
				});
			});
		},

		// 背景图上传方法
		uploadBackground() {
			return new Promise((resolve, reject) => {
				if (!this.backgroundTempFilePath) {
					resolve(null);
					return;
				}

				uni.uploadFile({
					url: `http://localhost:8080/shop/uploadShopImages`,
					filePath: this.backgroundTempFilePath,
					name: 'file',
					success: (res) => {
						try {
							const result = JSON.parse(res.data);
							if (result.code === 200) {
								resolve(result.data);
							} else {
								reject(new Error(result.message || '背景图上传失败'));
							}
						} catch (e) {
							reject(e);
						}
					},
					fail: (err) => {
						reject(err);
					}
				});
			});
		},

		// 保存店铺信息
		async saveShopInfo() {
			// 表单验证
			if (!this.validateForm()) return;

			try {
				// 上传Logo
				const logoResult = await this.uploadLogo();
				if (logoResult) {
					this.shopInfo.shopLogo = logoResult;
				}

				// 上传背景图
				const backgroundResult = await this.uploadBackground();
				if (backgroundResult) {
					this.shopInfo.ShopImages = backgroundResult;
				}

				// 保存店铺信息
				uni.request({
					url: `http://localhost:8080/shop`,
					method: 'PUT',
					data: this.shopInfo,
					success: (res) => {
						if (res.data.code === 200) {
							uni.showToast({
								title: '保存成功',
								icon: 'success'
							});
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} else {
							uni.showToast({
								title: res.data.message || '保存失败',
								icon: 'none'
							});
						}
					},
					fail: () => {
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				console.error('处理图片上传时发生错误:', error);
				uni.showToast({
					title: error.message || '处理图片上传失败',
					icon: 'none'
				});
			}
		},

		// 表单验证
		validateForm() {
			const { shopName, shopPhone, shopAddress } = this.shopInfo;

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
	onLoad() {
		// 获取用户信息
		uni.getStorage({
			key: 'userInfo',
			success: (res) => {
				this.userInfo = res.data;

				// 获取当前店铺信息
				uni.request({
					url: `http://localhost:8080/shop/${this.userInfo.shopId}`,
					method: 'GET',
					success: (res) => {
						this.shopInfo = res.data.data;
					}
				});
			}
		});
	}
}
</script>

<style lang="scss" scoped>
.edit-shop-container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding: 30rpx;

	.nav-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;

		.page-title {
			font-size: 36rpx;
			font-weight: bold;
		}

		.save-icon {
			color: #4CAF50;
			font-size: 32rpx;
		}
	}

	.edit-form {
		background-color: white;
		border-radius: 20rpx;
		padding: 30rpx;

		.form-item {
			margin-bottom: 30rpx;

			.label {
				display: block;
				margin-bottom: 15rpx;
				font-size: 32rpx;
				color: #333;
			}

			.upload-logo,
			.upload-background {
				position: relative;
				width: 200rpx;
				border-radius: 20rpx;
				overflow: hidden;

				&.upload-background {
					width: 100%;
					height: 400rpx;
				}

				image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.upload-tips {
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					text-align: center;
					background: rgba(0, 0, 0, 0.5);
					color: white;
					padding: 10rpx 0;
				}
			}

			.input-field,
			.textarea-field {
				width: 100%;
				border: 1rpx solid #e0e0e0;
				border-radius: 10rpx;
				padding: 20rpx;
				font-size: 32rpx;
			}

			.textarea-field {
				height: 200rpx;
			}
		}
	}
}
</style>