<template>
	<view class="product-form-container">
		<view class="nav-header">
			<text class="page-title">添加商品</text>
		</view>

		<view class="form-content">
			<view class="form-item">
				<text class="label">商品名称</text>
				<input type="text" v-model="formData.tabulateName" placeholder="请输入商品名称" class="input-field" />
			</view>

			<view class="form-item">
				<text class="label">商品价格</text>
				<input type="digit" v-model="formData.tabulatePrice" placeholder="请输入商品价格" class="input-field" />
			</view>

			<view class="form-item">
				<text class="label">商品描述</text>
				<textarea v-model="formData.tabulateDescription" placeholder="请输入商品描述" class="textarea-field" />
			</view>

			<view class="form-item">
				<text class="label">商品库存</text>
				<input type="number" v-model="formData.tabulateStock" placeholder="请输入商品库存" class="input-field" />
			</view>
		</view>

		<view class="image-section">
			<text class="section-title">商品图片</text>
			<view class="image-upload-area" @click="handleImageUpload">
				<block v-if="formData.tabulateImage">
					<image :src="formData.tabulateImage" mode="aspectFill" class="preview-image"></image>
					<text class="upload-tip">点击更换图片</text>
				</block>
				<block v-else>
					<view class="upload-placeholder">
						<text class="upload-icon">+</text>
						<text class="upload-text">点击上传图片</text>
					</view>
				</block>
			</view>
		</view>

		<view class="submit-btn" @click="submitForm">提交商品信息</view>
	</view>
</template>

<script>
import request from '@/utils/request.js'
export default {
	data() {
		return {
			productId: null,
			tempFilePath: '',
			formData: {
				tabulateImage: '',
				tabulateName: '',
				tabulatePrice: '',
				tabulateDescription: '',
				tabulateStock: '',
				tabulateType: null,
				shopId: '',
				tabuleTabs: ''
			}
		};
	},

	onLoad(options) {
		if (options.shopId) {
			this.formData.shopId = options.shopId;
		} else {
			uni.showToast({
				title: '缺少商铺ID',
				icon: 'none'
			});
			uni.navigateBack();
		}
	},

	methods: {
		validateBasicInfo() {
			const validations = [
				{ field: 'tabulateName', message: '请输入商品名称' },
				{ field: 'tabulatePrice', message: '请输入商品价格' },
				{ field: 'tabulateStock', message: '请输入商品库存' }
			];

			for (const validation of validations) {
				if (!this.formData[validation.field]) {
					uni.showToast({
						title: validation.message,
						icon: 'none'
					});
					return false;
				}
			}
			return true;
		},

		async handleImageUpload() {

			if (!this.validateBasicInfo()) return;

			try {

				if (!this.productId) {
					await this.submitBasicInfo();
				}

				await this.chooseAndUploadImage();
			} catch (error) {
				uni.showToast({
					title: error.message || '操作失败',
					icon: 'none'
				});
			}
		},

		async submitBasicInfo() {
			try {
				uni.showLoading({
					title: '提交商品信息...'
				});

				const res = await request.request({
					url: '/tabulate/add',
					method: 'POST',
					data: this.formData
				});

				if (res.data.code === 200) {
					this.productId = res.data.data.tabulateId;
				} else {
					throw new Error(res.data.msg || '商品信息提交失败');
				}
			} catch (error) {
				throw new Error(error.message || '商品信息提交失败');
			} finally {
				uni.hideLoading();
			}
		},

		async chooseAndUploadImage() {
			try {
				const chooseResult = await uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera']
				});

				this.tempFilePath = chooseResult.tempFilePaths[0];
				await this.uploadImage();
			} catch (error) {
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		},

		async uploadImage() {
			try {
				uni.showLoading({
					title: '上传图片中...'
				});

				const uploadResult = await request.uploadFile({
					url: `/tabulate/uploadTabulateImages/${this.productId}`,
					filePath: this.tempFilePath,
					name: 'file'
				});

				const result = JSON.parse(uploadResult.data);
				if (result.code === 200) {
					this.formData.tabulateImage = result.data;
					await this.updateProduct();
				} else {
					throw new Error(result.msg || '图片上传失败');
				}
			} catch (error) {
				throw new Error(error.message || '图片上传失败');
			} finally {
				uni.hideLoading();
			}
		},

		async updateProduct() {
			try {
				const res = await request.request({
					url: '/tabulate/update',
					method: 'PUT',
					data: {
						tabulateId: this.productId,
						...this.formData
					}
				});

				if (res.data.code === 200) {
					uni.showToast({
						title: '商品添加成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					throw new Error(res.data.msg || '更新商品信息失败');
				}
			} catch (error) {
				throw new Error(error.message || '更新商品信息失败');
			}
		},

		async submitForm() {
			if (!this.validateBasicInfo()) return;
			
			try {
				// 如果已经上传了图片，说明基本信息已提交，直接返回
				if (this.formData.tabulateImage) {
					uni.navigateBack();
					return;
				}
				
				// 否则提示用户上传图片
				uni.showToast({
					title: '请上传商品图片',
					icon: 'none'
				});
			} catch (error) {
				uni.showToast({
					title: error.message || '操作失败',
					icon: 'none'
				});
			}
		}
	}
};
</script>


<style lang="scss" scoped>
	.product-form-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 30rpx;
		margin-right: 30rpx;

		.nav-header {
			display: flex;
			align-items: center;
			margin-bottom: 40rpx;

			.page-title {
				font-size: 40rpx;
				font-weight: bold;
			}
		}

		.form-content {
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;

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
			}
		}

		.image-section {
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 120rpx;

			.section-title {
				font-size: 32rpx;
				color: #333;
				margin-bottom: 20rpx;
				display: block;
			}

			.image-upload-area {
				width: 100%;
				min-height: 300rpx;
				border: 2rpx dashed #ddd;
				border-radius: 10rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;

				.preview-image {
					width: 100%;
					height: 300rpx;
					border-radius: 10rpx;
				}

				.upload-tip {
					margin-top: 10rpx;
					color: #666;
					font-size: 24rpx;
				}

				.upload-placeholder {
					display: flex;
					flex-direction: column;
					align-items: center;

					.upload-icon {
						font-size: 60rpx;
						color: #999;
						margin-bottom: 10rpx;
					}

					.upload-text {
						font-size: 28rpx;
						color: #999;
					}
				}
			}
		}

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
	}
</style>