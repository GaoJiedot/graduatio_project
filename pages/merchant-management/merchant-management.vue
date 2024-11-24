<template>
	<view class="merchant-management-container">
		<view class="page-header">
			<view class="header-actions">
				<input class="search-input" placeholder="搜索用户名/手机号" confirm-type="search" v-model="searchQuery"
					@confirm="searchshops" />
				<button class="searchuser" @click="searchshops">搜索</button>
			</view>
		</view>
		<scroll-view scroll-y class="merchant-list">
			<view v-for="(merchant, index) in merchantList" :key="index" class="merchant-card">
				<view class="merchant-header">
					<view class="merchant-avatar">
						<image :src="merchant.shopLogo" mode="aspectFill"></image>
					</view>
					<view class="merchant-basic-info">
						<text class="merchant-name">{{ merchant.shopName}}</text>
						<text class="merchant-contact">{{ merchant.shopKeeper }}</text>
					</view>
					<view class="merchant-status">
						<text :class="['status-tag', merchant.shopStatus === 0 ? 'active' : 'blocked']">
							{{ merchant.shopStatus === 0 ? '营业中' :'已休息'}}
						</text>
					</view>
				</view>

				<view class="merchant-details">
					<view class="detail-item">
						<text class="label">联系电话</text>
						<text class="value">{{ merchant.shopPhone}}</text>
					</view>
				</view>

				<view class="merchant-actions">
					<view class="action-btn detail" @click="editShop(merchant)">
						店铺管理
					</view>
					<view class="action-btn manage" @click="manageMerchant(merchant)">
						下架店铺
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			merchantList: [],
			searchQuery: '',
			currentPage: 1,
			pageSize: 10
		}
	},
	methods: {
		getShop() {
			uni.request({
				url: `http://localhost:8080/shop/admin/all`,
				method: 'GET',
				success: (res) => {
					if (res.data.code === 200) {
						this.merchantList = res.data.data
						console.log('获取所有商家:', res.data.data)
					} else {
						uni.showToast({
							title: '获取商家列表失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('请求失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				}
			})
		},
		
		editShop(merchant) {
			uni.navigateTo({
					url: `/pages/edit-shop/edit-shop?shopId=${merchant.shopId}`
				})
		},

		manageMerchant(merchant) {
			uni.showModal({
				title: '是否确认下架',
					content: `确认下架店铺 ${merchant.shopName} 吗？`,
					success: (res) => {
						if (res.confirm) {
							uni.request({
								url: `http://localhost:8080/shop/${merchant.shopId}`,
								method: 'DELETE',
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '下架成功',
											icon: 'success'
										});
										this.getShop();
									} else {
										uni.showToast({
											title: '下架取消',
											icon: 'none'
										});
									}
								},
								fail: (err) => {
									console.error('下架失败:', err);
									uni.showToast({
										title: '网络请求失败',
										icon: 'none'
									});
								}
							});
						}
					}
			})
		},
		
		searchshops() {
			if (!this.searchQuery.trim()) {
				this.getShop();
				return;
			}
			
			uni.showLoading({
				title: '搜索中...'
			});
			
			uni.request({
				url: `http://localhost:8080/shop/shop/${this.searchQuery}`,
				method: 'GET',
				data: {
					query: this.searchQuery,
					page: this.currentPage,
					limit: this.pageSize
				},
				success: (res) => {
					uni.hideLoading();
					if (res.data.code === 200) {
						if (Array.isArray(res.data.data)) {
							this.merchantList = res.data.data;
						} else if (res.data.data) {
							this.merchantList = [res.data.data];
						} else {
							this.merchantList = [];
							uni.showToast({
								title: '未找到相关商家',
								icon: 'none'
							});
						}
					} else {
						uni.showToast({
							title: res.data.msg || '搜索失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					uni.hideLoading();
					console.error('搜索失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				}
			});
		},
		
	},
	onLoad() {
		this.getShop()
	},
	watch: {
		searchQuery: {
			handler(newVal, oldVal) {
				if (newVal.trim() !== oldVal.trim()) {
					this.searchshops();
				}
			},
			immediate: false
		}
	}
}
</script>

<style lang="scss" scoped>
	.merchant-management-container {
		width: auto;
		background-color: #f5f5f5;
		padding: 30rpx;
		position: relative;

		.page-header {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-bottom: 30rpx;

			.header-actions {
				display: flex;
				align-items: center;

				.search-input {
					border: 1px solid #ccc;
					border-radius: 20rpx;
					padding: 10rpx 15rpx;
					width: 300rpx;
					font-size: 28rpx;
					background-color: #fff;
					box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
					transition: border 0.3s;
					margin-right: 10rpx;

					&:focus {
						border: 1px solid #4CAF50;
					}
				}

				.searchuser,
				.delete-selected {
					padding: 10rpx 20rpx;
					background-color: #4CAF50;
					color: #fff;
					border-radius: 20rpx;
					margin-left: 10rpx;
					cursor: pointer;
					box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.3);
					transition: all 0.3s;
					font-size: 24rpx;

					&:hover {
						background-color: #45a049;
						box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.4);
					}
				}
			}
		}

		// 搜索栏
		.search-bar {
			display: flex;
			align-items: center;
			margin-bottom: 30rpx;

			.search-input {
				flex-grow: 1;
				background-color: white;
				border-radius: 30rpx;
				display: flex;
				align-items: center;
				justify-self: center;
				padding: 10rpx 20rpx;
				margin-right: 20rpx;

				.search-icon {
					width: 40rpx;
					height: 40rpx;
					margin-right: 10rpx;
				}

				input {
					flex-grow: 1;
					font-size: 30rpx;
				}

				.searchshop {
					padding: 10rpx 20rpx;
					background-color: #4CAF50;
					color: #fff;
					border-radius: 20rpx;
					margin-left: 10rpx;
					cursor: pointer;
					box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.3);
					transition: all 0.3s;
					font-size: 24rpx;

					&:hover {
						background-color: #45a049;
						box-shadow: 0 4rpx 10rpx rgba(76, 175, 80, 0.4);
					}
				}
			}

			.filter-icon {
				image {
					width: 50rpx;
					height: 50rpx;
				}
			}
		}

		// 商家列表
		.merchant-list {

			.merchant-card {
				background-color: white;
				border-radius: 20rpx;
				padding: 20rpx;
				margin-bottom: 20rpx;
				box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);

				// 商家头部
				.merchant-header {
					display: flex;
					align-items: center;
					margin-bottom: 20rpx;

					.merchant-avatar {
						image {
							width: 100rpx;
							height: 100rpx;
							border-radius: 50%;
							margin-right: 20rpx;
						}
					}

					.merchant-basic-info {
						flex-grow: 1;
						display: flex;
						flex-direction: column;

						.merchant-name {
							font-size: 36rpx;
							font-weight: bold;
						}

						.merchant-contact {
							font-size: 28rpx;
							color: #666;
							margin-top: 5rpx;
						}
					}

					.merchant-status {
						.status-tag {
							padding: 5rpx 15rpx;
							border-radius: 10rpx;
							font-size: 24rpx;

							&.active {
								background-color: #e6f3ea;
								color: #4CAF50;
							}

							&.pending {
								background-color: #fff3e0;
								color: #FF9800;
							}

							&.blocked {
								background-color: #fde6e6;
								color: #f44336;
							}
						}
					}
				}

				// 商家详细信息
				.merchant-details {
					border-top: 1rpx solid #eee;
					border-bottom: 1rpx solid #eee;
					padding: 20rpx 0;
					margin-bottom: 20rpx;

					.detail-item {
						display: flex;
						justify-content: space-between;
						margin-bottom: 10rpx;

						.label {
							color: #666;
							font-size: 30rpx;
						}

						.value {
							color: #333;
							font-size: 32rpx;
						}
					}
				}

				// 操作按钮
				.merchant-actions {
					display: flex;
					justify-content: space-between;

					.action-btn {
						flex-grow: 1;
						text-align: center;
						padding: 15rpx;
						border-radius: 10rpx;
						font-size: 32rpx;
						margin: 0 10rpx;

						&.detail {
							background-color: #2196F3;
							color: white;
						}

						&.manage {
							background-color: #4CAF50;
							color: white;
						}
					}
				}
			}
		}

		.float-add-btn {
			position: fixed;
			bottom: 50rpx;
			right: 50rpx;
			width: 100rpx;
			height: 100rpx;
			background-color: #4CAF50;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);

			image {
				width: 50rpx;
				height: 50rpx;
			}
		}
	}
</style>