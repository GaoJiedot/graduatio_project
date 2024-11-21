<!-- 店铺管理页面 -->
<template>
    <view class="shop-management-container">

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

        <!-- 店铺详细信息 -->
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

        <!-- 快捷操作 -->
        <view class="quick-actions">
            <view class="action-item" @click="editShopInfo">
                <image src="/static/menuicon/设置.png" mode="aspectFit"></image>
                <text>编辑信息</text>
            </view>
            <view class="action-item" @click="goToProductManagement">
                <image src="/static/menuicon/商品.png" mode="aspectFit" ></image>
                <text>商品管理</text>
            </view>
           
        </view>
		
    </view>
</template>

<script>
export default {
    data() {
        return {
			userInfo: {},
            shopInfo: {}
        }
    },
    methods: {
        // 编辑店铺信息
        editShopInfo() {
            uni.navigateTo({
                url: '/pages/edit-shop/edit-shop'
            })
        },
        // 跳转商品管理
        goToProductManagement() {
            uni.navigateTo({
                 url: '/pages/product-management/product-management'
            })
        },
		getshopInfo(){
			uni.request({
				url: `http://localhost:8080/shop/${this.userInfo.shopId}`,
					method: 'GET',
					success: (res) => {
						this.shopInfo = res.data.data
						console.log(this.shopInfo)
					}
			})
    },
	onLoad() {
		uni.getStorage({
			key: 'userInfo',
			success: (res) => {
				this.userInfo = res.data
				console.log(this.userInfo.shopId)
				
			}
		}),
		this.getshopInfo()
		},
		onShow() {
			this.getshopInfo()
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

    // 顶部导航
    .nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40rpx;

        .back-icon, .add-icon {
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
        box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);

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