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
				<text class="label">营业时间:</text>
				<view class="time-picker-container">
					<view class="time-picker">
						<picker mode="time" :value="openTime" @change="onOpenTimeChange">
							<view class="picker-field">
								<text>开始时间: {{openTime || '请选择'}}</text>
							</view>
						</picker>
					</view>
					<text class="time-separator">至</text>
					<view class="time-picker">
						<picker mode="time" :value="closeTime" @change="onCloseTimeChange">
							<view class="picker-field">
								<text>结束时间: {{closeTime || '请选择'}}</text>
							</view>
						</picker>
					</view>
				</view>
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
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				userInfo: {},
				shopInfo: {
					shopLogo: '',
					shopImages: '',
					shopName: '',
					shopDescription: '',
					shopPhone: null,
					shopBusinessHours: '',
					shopAddress: '',
					
				},
				tempLogoPath: '',
				tempBackgroundPath: '',
				shopId: '',
				openTime: '',
				closeTime: ''
			};
		},
		methods: {
			 onOpenTimeChange(e) {
			      this.openTime = e.detail.value;
			      this.updateBusinessHours();
			    },
			onCloseTimeChange(e) {
			      this.closeTime = e.detail.value;
			      this.updateBusinessHours();
			    },
				updateBusinessHours() {
				      if (this.openTime && this.closeTime) {
				        this.shopInfo.shopBusinessHours = `${this.openTime}-${this.closeTime}`;
				      }
				    },
			chooseImage(type) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						// 添加文件大小检查
						if (res.tempFiles[0].size > 5 * 1024 * 1024) { // 5MB限制
							uni.showToast({
								title: '图片大小不能超过5MB',
								icon: 'none'
							});
							return;
						}

						// 仅在前端显示预览图
						if (type === 'logo') {
							this.tempLogoPath = tempFilePath;
							// 仅用于预览
							this.shopInfo.shopLogo = tempFilePath;
						} else if (type === 'background') {
							this.tempBackgroundPath = tempFilePath;
							// 仅用于预览
							this.shopInfo.shopImages = tempFilePath;
						}
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},

			// 上传文件方法优化
			async uploadFile(filePath, type) {
				if (!filePath) return null;
				if (!this.shopId) {
					uni.showToast({
						title: '店铺ID不能为空',
						icon: 'none'
					});
					return null;
				}

				return new Promise((resolve, reject) => {
					// 设置请求头和参数
					const uploadTask = request.uploadFile({
						url: type === 'logo' ?
							`/shop/uploadShopLogo/${this.shopId}` :
							`/shop/uploadShopImages/${this.shopId}`,
						filePath: filePath,
						name: 'file', // 确保这个名字与后端接收文件的参数名一致
						formData: {
							shopId: this.shopId,
							type: type
						},
						success: (uploadRes) => {
							try {
								// 确保服务器返回的是 JSON 字符串
								const result = typeof uploadRes.data === 'string' ?
									JSON.parse(uploadRes.data) :
									uploadRes.data;

								if (result.code === 200) {
									// 使用服务器返回的实际URL替换临时路径
									resolve(result.data);
								} else {
									reject(new Error(result.message || '上传失败'));
								}
							} catch (e) {
								console.error('解析响应数据失败:', e);
								reject(new Error('解析响应数据失败'));
							}
						},
						fail: (err) => {
							console.error('上传失败:', err);
							reject(new Error('网络请求失败'));
						}
					});

					// 监听上传进度
					uploadTask.onProgressUpdate((res) => {
						console.log('上传进度', res.progress);
						// 可以在这里添加上传进度条
					});
				}).catch(error => {
					uni.showToast({
						title: error.message || '上传失败',
						icon: 'none'
					});
					return null;
				});
			},

			// 保存店铺信息方法优化
			 async saveShopInfo() {
			      if (!this.validateForm()) return;
			
			      // 确保更新营业时间
			      this.updateBusinessHours();
			
			      uni.showLoading({
			        title: '保存中...'
			      });
			
			      try {
			        let updatedShopInfo = {
			          ...this.shopInfo
			        };
			
			        // 先上传图片
			        if (this.tempLogoPath) {
			          const logoUrl = await this.uploadFile(this.tempLogoPath, 'logo');
			          if (logoUrl) {
			            updatedShopInfo.shopLogo = logoUrl;
			          }
			        }
			
			        if (this.tempBackgroundPath) {
			          const backgroundUrl = await this.uploadFile(this.tempBackgroundPath, 'background');
			          if (backgroundUrl) {
			            updatedShopInfo.shopImages = backgroundUrl;
			          }
			        }
			
			        // 使用更新后的信息保存
			        const res = await this.updateShopInfo(updatedShopInfo);
			
			        uni.hideLoading();
			        if (res.code === 200) {
			          // 更新成功后清除临时路径
			          this.tempLogoPath = '';
			          this.tempBackgroundPath = '';
			
			          uni.showToast({
			            title: '保存成功',
			            icon: 'success'
			          });
			          setTimeout(() => {
			            uni.navigateBack();
			          }, 1500);
			        } else {
			          throw new Error(res.message || '保存失败');
			        }
			      } catch (error) {
			        uni.hideLoading();
			        uni.showToast({
			          title: error.message || '保存失败',
			          icon: 'none'
			        });
			      }
			    },

			// 更新店铺信息
			updateShopInfo(shopData) {
				return new Promise((resolve, reject) => {
					request.request({
						url: `/shop/update`,
						method: 'PUT',
						data: {
							...shopData,
							shopId: this.shopId
						},
						success: (res) => {
							resolve(res.data);
						},
						fail: (err) => {
							reject(new Error('网络请求失败'));
						}
					});
				});
			},

			// 获取店铺信息时保存初始数据
			 getShopInfo() {
			      request.request({
			        url: `/shop/${this.shopId}`,
			        method: 'GET',
			        success: (res) => {
			          if (res.data.code === 200) {
			            const shopData = res.data.data;
			            this.shopInfo = shopData;
			
			            // 解析营业时间
			            if (shopData.shopBusinessHours) {
			              const [open, close] = shopData.shopBusinessHours.split('-');
			              this.openTime = open;
			              this.closeTime = close;
			            }
			            
			            // 保存初始图片URL
			            this.initialLogo = this.shopInfo.shopLogo;
			            this.initialBackground = this.shopInfo.shopImages;
			          }
			        }
			      });
			    },


			 validateForm() {
			      const {
			        shopName,
			        shopPhone,
			        shopAddress,
			        shopBusinessHours
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
			
			      if (!this.openTime || !this.closeTime) {
			        uni.showToast({
			          title: '请选择营业时间',
			          icon: 'none'
			        });
			        return false;
			      }
			
			      // 验证结束时间是否晚于开始时间
			      const start = new Date(`2000/01/01 ${this.openTime}`);
			      const end = new Date(`2000/01/01 ${this.closeTime}`);
			      if (end <= start) {
			        uni.showToast({
			          title: '结束时间必须晚于开始时间',
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
			    },

		},
		onLoad(options) {
			this.shopId = options.shopId
			this.getShopInfo()
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

				.time-picker-container {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;

					.time-picker {
						flex: 1;

						.picker-field {
							height: 80rpx;
							border: 2rpx solid #ddd;
							border-radius: 10rpx;
							padding: 0 20rpx;
							display: flex;
							align-items: center;
							font-size: 28rpx;
						}
					}

					.time-separator {
						margin: 0 20rpx;
						color: #666;
					}
				}


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