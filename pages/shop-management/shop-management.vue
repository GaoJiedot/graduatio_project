<!-- 店铺管理页面 -->
<template>
    <view class="shop-management-container">
        <!-- Loading State -->
        <view v-if="loading" class="loading-container">
            <text>加载中...</text>
        </view>

        <!-- Error State -->
        <view v-else-if="error" class="error-container">
            <text>{{ error }}</text>
        </view>

        <!-- Content -->
        <view v-else>
            <view class="shop-card">
                <view class="shop-avatar">
                    <image :src="shopInfo.shopLogo" mode="aspectFill"></image>
                </view>
                <view class="shop-info">
                    <text class="shop-name">{{ shopInfo.shopName }}</text>
                    <text class="shop-desc">{{ shopInfo.shopDescription }}</text>
                </view>
                <view class="shop-status">
                    <text :class="['status-tag', shopInfo.shopStatus === 0 ? 'active' : 'inactive']">
                        {{ shopInfo.shopStatus === 0 ? '营业中' : '已关店' }}
                    </text>
                </view>
            </view>

            <view class="shop-details">
                <view class="detail-item">
                    <text class="label">联系电话</text>
                    <text class="value">{{ shopInfo.shopPhone }}</text>
                </view>
                <view class="detail-item">
                    <text class="label">营业时间</text>
                    <text class="value">{{ shopInfo.shopBusinessHours }}</text>
                </view>
                <view class="detail-item">
                    <text class="label">店铺地址</text>
                    <text class="value">{{ shopInfo.shopAddress }}</text>
                </view>
            </view>

            <view class="quick-actions">
                <view class="action-item" @click="editShopInfo">
                    <image src="/static/menuicon/设置.png" mode="aspectFit"></image>
                    <text>编辑信息</text>
                </view>
                <view class="action-item" @click="goToProductManagement">
                    <image src="/static/menuicon/商品.png" mode="aspectFit"></image>
                    <text>商品管理</text>
                </view>
            </view>
        </view>
    </view>
</template>
<script>
export default {
    data() {
        return {
            userInfo: {},
            shopInfo: {},
            loading: true,
            error: null
        }
    },
    methods: {
        editShopInfo() {
            uni.navigateTo({
                url: '/pages/edit-shop/edit-shop'
            })
        },
        goToProductManagement() {
            uni.navigateTo({
                url: `/pages/product-management/product-management?shopId=${this.userInfo.shopId}`
            })
        },
        async getUserInfo() {
            return new Promise((resolve, reject) => {
                uni.getStorage({
                    key: 'userInfo',
                    success: (res) => {
                        this.userInfo = res.data;
                        if (!this.userInfo.shopId) {
                            reject(new Error('未找到店铺信息'));
                            return;
                        }
                        resolve(res.data);
                    },
                    fail: (err) => {
                        reject(new Error('获取用户信息失败'));
                    }
                });
            });
        },
        async getShopInfo() {
            return new Promise((resolve, reject) => {
                uni.request({
                    url: `http://localhost:8080/shop/${this.userInfo.shopId}`,
                    method: 'GET',
                    success: (res) => {
                        if (!res.data.data) {
                            reject(new Error('获取店铺信息失败'));
                            return;
                        }
                        this.shopInfo = res.data.data;
                        resolve(res.data.data);
                    },
                    fail: (err) => {
                        reject(new Error('网络请求失败'));
                    }
                });
            });
        },
        async initData() {
            try {
                this.loading = true;
                this.error = null;
                await this.getUserInfo();
                await this.getShopInfo();
                this.loading = false;
            } catch (error) {
                this.error = error.message;
                this.loading = false;
            }
        }
    },
    onLoad() {
        this.initData();
    },
    onShow() {
        if (this.userInfo.shopId) {
            this.getShopInfo();
        }
    }
}
</script>

<style lang="scss" scoped>
	.shop-management-container {
		width: auto;
		min-height: 896rpx;
		background-color: #f5f5f5;
		padding: 30rpx;

		.loading-container,
		    .error-container {
		        display: flex;
		        justify-content: center;
		        align-items: center;
		        height: 500rpx;
		        text-align: center;
		    }
		
		    .error-container {
		        color: #f44336;
		    }
		// 顶部导航
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

		// 店铺信息卡片
		.shop-card {
			background-color: white;
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			padding: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);

			.shop-avatar {
				image {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					margin-right: 30rpx;
				}
			}

			.shop-info {
				flex-grow: 1;

				.shop-name {
					font-size: 36rpx;
					font-weight: bold;
					display: block;
				}

				.shop-desc {
					font-size: 28rpx;
					color: #666;
					display: block;
					margin-top: 10rpx;
				}
			}

			.shop-status {
				.status-tag {
					padding: 5rpx 15rpx;
					border-radius: 10rpx;
					font-size: 24rpx;

					&.active {
						background-color: #e6f3ea;
						color: #4CAF50;
					}

					&.inactive {
						background-color: #fde6e6;
						color: #f44336;
					}
				}
			}
		}

		// 店铺详细信息
		.shop-details {
			background-color: white;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;

			.detail-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #eee;

				.label {
					font-size: 30rpx;
					color: #666;
				}

				.value {
					font-size: 32rpx;
					color: #333;
				}

				&:last-child {
					border-bottom: none;
				}
			}
		}

		// 快捷操作
		.quick-actions {
			display: flex;
			justify-content: space-between;

			.action-item {
				background-color: white;
				border-radius: 20rpx;
				width: 30%;
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 40rpx;

				image {
					width: 80rpx;
					height: 80rpx;
					margin-bottom: 15rpx;
				}

				text {
					font-size: 28rpx;
					color: #333;
				}
			}
		}

	}
</style>