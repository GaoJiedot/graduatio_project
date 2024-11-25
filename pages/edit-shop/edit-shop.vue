<template>
	<view class="edit-shop-container">
		<view class="nav-header">
			<text class="page-title">您的店铺信息:</text>
		</view>

		<view class="edit-form">
			<view class="form-item">
				<text class="label">店铺Logo:</text>
				<view class="upload-logo" @click="chooseImage('logo')">
					<image :src="shopInfo.shopLogo" mode="aspectFill"></image>
					<text class="upload-tips">点击上传</text>
				</view>
			</view>

			<view class="form-item">
				<text class="label">店铺背景图:</text>
				<view class="upload-background" @click="chooseImage('background')">
					<image :src="shopInfo.shopImages" mode="aspectFill">
					</image>
					<text class="upload-tips">点击上传背景</text>
				</view>
			</view>

			<view class="form-item">
				<text class="label">店铺名称:</text>
				<input class="input-field" v-model="shopInfo.shopName" placeholder="请输入店铺名称" />
			</view>

			<view class="form-item">
				<text class="label">店铺描述:</text>
				<textarea class="textarea-field" v-model="shopInfo.shopDescription" placeholder="简单介绍您的店铺"
					maxlength="200"></textarea>
			</view>

			<view class="form-item">
				<text class="label">联系电话:</text>
				<input class="input-field" v-model="shopInfo.shopPhone" type="number" placeholder="请输入联系电话" />
			</view>


			<view class="form-item">
				<text class="label">店铺地址:</text>
				<input class="input-field" v-model="shopInfo.shopAddress" placeholder="请输入详细地址" />
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
			userInfo: {},
			shopInfo: {
				shopLogo: '',
				shopImages: '',
				shopName: '',
				shopDescription: '',
				shopPhone:null,
				shopBusinessHours: '',
				shopAddress: ''
			},
			tempLogoPath: '',
			tempBackgroundPath: ''
		}
	},
	methods: {
		chooseImage(type) {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					if (type === 'logo') {
						this.tempLogoPath = res.tempFilePaths[0];
						this.shopInfo.shopLogo = this.tempLogoPath;
					} else if (type === 'background') {
						this.tempBackgroundPath = res.tempFilePaths[0];
						this.shopInfo.shopImages = this.tempBackgroundPath;
					}
				}
			});
		},

		async uploadFile(filePath, type) {
			if (!filePath) return null;

			try {
				const uploadUrl = type === 'logo' 
					? `http://localhost:8080/shop/uploadShopLogo/${this.userInfo.shopId}`
					: `http://localhost:8080/shop/uploadShopImages/${this.userInfo.shopId}`;

				const res = await uni.uploadFile({
					url: uploadUrl,
					method: 'PUT',
					filePath: filePath,
					name: 'file'
				});
				
				const result = JSON.parse(res.data);
				if (result.code === 200) {
					return result.data;
				} else {
					throw new Error(result.message || '上传失败');
				}
			} catch (e) {
				console.error(e);
				uni.showToast({
					title: '上传失败',
					icon: 'none'
				});
				return null;
			}
		},

		async saveShopInfo() {
			if (!this.validateForm()) return;

			if (this.tempLogoPath) {
				const uploadedLogo = await this.uploadFile(this.tempLogoPath, 'logo');
				if (uploadedLogo) {
					this.shopInfo.shopLogo = uploadedLogo;
				}
			}
			if (this.tempBackgroundPath) {
				const uploadedBackground = await this.uploadFile(this.tempBackgroundPath, 'background');
				if (uploadedBackground) {
					this.shopInfo.shopImages = uploadedBackground;
				}
			}

			// 保存店铺信息
			uni.request({
				url: `http://localhost:8080/shop/update`,
				method: 'PUT',
				data: {
					...this.shopInfo,
					shopId: this.userInfo.shopId
				},
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
							title: '保存失败',
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
	onLoad() {
		uni.getStorage({
			key: 'userInfo',
			success: (res) => {
				this.userInfo = res.data;

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