<template>
	<view class="product-form-container">
		<view class="nav-header">
			<text class="page-title">编辑商品</text>
		</view>
		<view class="form-content">
			<view class="form-item">
				<text class="label">商品图片</text>
				<view class="image-upload" @click="chooseImage">
					<image v-if="formData.tabulateImage" :src="formData.tabulateImage" mode="aspectFill"></image>
					<view v-else class="upload-placeholder">
						<image src="/static/icon/upload.png" mode="aspectFit"></image>
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

		<view class="submit-btn" @click="submitForm">保存修改</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				productId: null,
				formData: {
					tabulateId: null,
					tabulateImage: '',
					tabulateName: '',
					tabulatePrice: '',
					tabulateDescription: '',
					tabulateStock: '',
					tabulateType: null,
					shopId: '',
					tabuleTabs: ''
				}
			}
		},

		onLoad(options) {
			this.productId = options.productId;
			console.log('loadProductData:', this.productId);
			request.request({
				url: `/tabulate/${this.productId}`,
				method: 'GET',
				success: (res) => {
					console.log('loadProductData:', res.data);
					if (res.data.code === 200) {
						this.formData = res.data.data;
						console.log("FormData:", this.formData)
					} else {
						uni.showToast({
							title: '获取商品信息失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					uni.showToast({
						title: '获取商品信息失败',
						icon: 'none'
					});
				}
			});
		},
		methods: {
			async chooseImage() {
				try {
					const chooseResult = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					});

					this.tempImagePath = chooseResult.tempFilePaths[0];
					this.formData.tabulateImage = chooseResult.tempFilePaths[0];
				} catch (error) {
					uni.showToast({
						title: error.message || '选择图片失败',
						icon: 'none'
					});
				}
			},

			validateForm() {
				if (!this.formData.tabulateImage) {
					uni.showToast({
						title: '请上传商品图片',
						icon: 'none'
					})
					return false
				}
				if (!this.formData.tabulateName) {
					uni.showToast({
						title: '请输入商品名称',
						icon: 'none'
					})
					return false
				}
				if (!this.formData.tabulatePrice) {
					uni.showToast({
						title: '请输入商品价格',
						icon: 'none'
					})
					return false
				}
				return true
			},
			async uploadImage(productId, filePath) {
			  try {
			    const uploadResult = await request.uploadFile({
			      url: `/tabulate/uploadTabulateImages/${productId}`,
			      filePath: filePath,
			      name: 'file', 
			      formData: {
			        tabulateId: productId
			      }
			    });
			
			    const data = JSON.parse(uploadResult.data);
			    if (data.code === 200) {
			      return data.data; 
			    } else {
			      throw new Error(data.msg || '图片上传失败');
			    }
			  } catch (error) {
			    throw error;
			  }
			},

			async submitForm() {
			  if (this.validateForm()) {
			    try {
			      uni.showLoading({ title: '提交中...' });
			
			      if (this.tempImagePath) {
			        const imageUrl = await this.uploadImage(this.formData.tabulateId, this.tempImagePath);
			        this.formData.tabulateImage = imageUrl; 
			      }
			
			      const res = await request.request({
			        url: `/tabulate/update`,
			        method: 'PUT',
			        data: this.formData
			      });
			
			      if (res.data.code === 200) {
			        uni.showToast({
			          title: '修改成功',
			          icon: 'success'
			        });
			        uni.navigateBack();
			      } else {
			        throw new Error(res.data.msg || '修改失败');
			      }
			    } catch (error) {
			      uni.showToast({
			        title: error.message || '操作失败',
			        icon: 'none'
			      });
			    } finally {
			      uni.hideLoading();
			    }
			  }
			}

		}
	}
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