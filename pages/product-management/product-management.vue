<template>
	<view class="product-management-container">
		<view class="nav-header">
			<view class="back-icon">
				<image src="/static/icon/back.png" mode="aspectFit"></image>
			</view>
			<text class="page-title">商品列表</text>
		</view>
		<scroll-view scroll-y class="product-list">
			<view v-for="(product, index) in productList" :key="index" class="product-item">
				<view class="product-image">
					<image :src="product.tabulateImage" mode="aspectFill"></image>
				</view>
				<view class="product-info">
					<text class="product-name">{{ product.tabulateName }}</text>
					<text class="product-price">¥ {{ product.tabulatePrice }}</text>
				</view>
				<view class="product-actions">
					<view class="action-btn edit" @click="editProduct(product)">编辑</view>
					<view class="action-btn delete" @click="deleteProduct(product)">下架</view>
				</view>
			</view>
		</scroll-view>
		<view class="float-add-btn" @click="addNewMerchant">
			<image src="/static/icon/添加 (1).png" mode="aspectFit"></image>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				shopId: null,
				productList: []
			}
		},
		methods: {
			addNewMerchant() {
				uni.navigateTo({
					  url: `/pages/add-product/add-product?shopId=${this.shopId}`
				})
			},
			editProduct(product) {
				uni.navigateTo({
					 url: `/pages/edit-product/edit-product?shopId=${this.shopId}&productId=${product.tabulateId}`
				})
			},
			deleteProduct(product) {
				console.log(product)
				uni.showModal({
					title: '提示',
					content: '确定要下架该商品吗？',
					success: (res) => {
						if (res.confirm) {
							request.request({
								url: `/tabulate/${product.tabulateId}`,
								method: 'DELETE',
								success: (res) => {
									if (res.data.code === 200) {
										uni.showToast({
											title: '下架成功',
											icon: 'success'
										})
										this.getProductList()
									} else {
										uni.showToast({
											title: '下架失败',
											icon: 'none'
										})
									}
								}
							})
						}
					}
				})
			},
			getProductList() {
				request.request({
					url: `/tabulate/getByShopId/${this.shopId}`,
					method: 'GET',
					success: (res) => {
						this.productList = res.data.data
						console.log(this.productList)

					}
				})
			}
		},
		onLoad(options) {
			this.shopId = options.shopId
			this.getProductList()
		},
		onShow() {
			this.getProductList()
		}
	}
</script>

<style lang="scss" scoped>
	.product-management-container {
		width: auto;
		min-height: 896rpx;
		background-color: #f5f5f5;
		padding: 30rpx;
		position: relative;

		// 顶部导航（与店铺管理保持一致）
		.nav-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 40rpx;

			.back-icon,
			.add-icon {
				image {
					width: 50rpx;
					height: 50rpx;
				}
			}

			.page-title {
				font-size: 40rpx;
				font-weight: bold;
			}
		}
		.product-list {

			.product-item {
				display: flex;
				align-items: center;
				background-color: white;
				border-radius: 20rpx;
				padding: 20rpx;
				margin-bottom: 20rpx;
				box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);

				.product-image {
					image {
						width: 150rpx;
						height: 150rpx;
						border-radius: 15rpx;
						margin-right: 20rpx;
					}
				}

				.product-info {
					flex-grow: 1;
					display: flex;
					flex-direction: column;

					.product-name {
						font-size: 36rpx;
						font-weight: bold;
					}

					.product-price {
						color: #FF5722;
						font-size: 32rpx;
						margin: 10rpx 0;
					}

					.product-stock {
						color: #666;
						font-size: 28rpx;
					}
				}

				.product-actions {
					display: flex;
					flex-direction: column;

					.action-btn {
						padding: 10rpx 20rpx;
						border-radius: 10rpx;
						font-size: 28rpx;
						text-align: center;
						margin-bottom: 10rpx;

						&.edit {
							background-color: #2196F3;
							color: white;
						}

						&.delete {
							background-color: #f44336;
							color: white;
						}
					}
				}
			}
		}

		.float-add-btn {
			position: fixed;
			bottom: 50rpx;
			left: 50rpx;
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