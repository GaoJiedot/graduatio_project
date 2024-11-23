<template>
	<view class="product-form-container">
		<view class="nav-header">
			<text class="page-title">添加商品</text>
		</view>

		<view class="form-content">
			<view class="form-item">
				<text class="label">商品图片</text>
				<view class="image-upload" @click="chooseImage">
					<image v-if="formData.tabulateImage" :src="formData.tabulateImage" mode="aspectFill"></image>
					<view v-else class="upload-placeholder">
						<text>点击上传图片</text>
					</view>
				</view>
			</view>

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

		<view class="submit-btn" @click="submitForm">添加商品</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				productId: null, // 存储新增商品的 ID
				tempImagePath: '', // 临时存储选择的图片路径
				formData: {
					tabulateImage: '', // 图片地址
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
			this.formData.shopId = options.shopId;

		},

		methods: {
			validateForm() {
				if (!this.formData.tabulateName) {
					uni.showToast({
						title: '请输入商品名称',
						icon: 'none'
					});
					return false;
				}
				if (!this.formData.tabulatePrice) {
					uni.showToast({
						title: '请输入商品价格',
						icon: 'none'
					});
					return false;
				}
				if (!this.formData.tabulateStock) {
					uni.showToast({
						title: '请输入商品库存',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			// 选择图片
			async chooseImage() {
				try {
					const chooseResult = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					});
					this.tempImagePath = chooseResult.tempFilePaths[0];
					this.formData.tabulateImage = chooseResult.tempFilePaths[0];
					console.log("图片路径", this.formData.tabulateImage);
					console.log("图片路径", this.tempImagePath);
					uni.showToast({
						title: '图片选择成功',
						icon: 'none'
					});
				} catch (error) {
					uni.showToast({
						title: error.message || '选择图片失败',
						icon: 'none'
					});
				}
			},

			async submitProductInfo() {
				try {
					uni.showLoading({
						title: '提交商品信息...'
					});

					// 提交商品基本信息
					const res = await uni.request({
						url: 'http://localhost:8080/tabulate/add', // 新增商品接口
						method: 'POST',
						data: this.formData

					});

					if (res.data.code === 200) {
						this.productId = res.data.data.tabulateId;
						console.log("this.productId",this.productId)
						console.log("res.data.data.tabulateId",res.data.data.tabulateId)
						
						uni.showToast({
							title: '商品信息提交成功',
							icon: 'success'
						});
					} else {
						throw new Error(res.data.msg || '商品信息提交失败');
					}
				} catch (error) {
					uni.showToast({
						title: error.message || '操作失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			async uploadImage(productId,prfilePath) {
				console.log("真实路径",filePath)
				if (!this.productId) {
					uni.showToast({
						title: '请先提交商品信息',
						icon: 'none'
					});
					return;
				}

				try {
					uni.showLoading({
						title: '上传图片中...'
					});

					const uploadResult = await uni.uploadFile({
						url: `http://localhost:8080/tabulate/uploadTabulateImages/${this.productId}`,
						filePath:this.tempImagePath,
						name: 'file'
					});

					const result = JSON.parse(uploadResult.data);
					console.log("hhhh", result);

					if (result.code === 200) {
						this.formData.tabulateImage = result.data;
						console.log("this.formData.tabulateImage", this.formData.tabulateImage);
						this.tempImagePath = '';
						uni.showToast({
							title: '图片上传成功',
							icon: 'success'
						});
					} else {
						throw new Error(data.msg || '图片上传失败');
					}
				} catch (error) {
					uni.showToast({
						title: error.message || '图片上传失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			async submitForm() {
				if (!this.validateForm()) return;

				await this.submitProductInfo();


				uni.navigateBack();
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
		}

		.form-content {
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;

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

				.image-upload {
					width: 200rpx;
					height: 200rpx;
					border: 2rpx dashed #ddd;
					border-radius: 10rpx;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					image {
						width: 100%;
						height: 100%;
						border-radius: 10rpx;
					}

					.upload-placeholder {
						display: flex;
						flex-direction: column;
						align-items: center;

						image {
							width: 60rpx;
							height: 60rpx;
							margin-bottom: 10rpx;
						}

						text {
							font-size: 24rpx;
							color: #999;
						}
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