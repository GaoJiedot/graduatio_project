<!-- 店铺管理页面 -->
<template>
    <view class="shop-management-container">
        <!-- 顶部导航 -->
        <view class="nav-header">
            <view class="back-icon">
                <image src="/static/icon/back.png" mode="aspectFit"></image>
            </view>
            <text class="page-title">店铺管理</text>
            <view class="add-icon">
                <image src="/static/icon/add.png" mode="aspectFit"></image>
            </view>
        </view>

        <!-- 店铺信息卡片 -->
        <view class="shop-card">
            <view class="shop-avatar">
                <image src="/static/icon/shop-default.png" mode="aspectFill"></image>
            </view>
            <view class="shop-info">
                <text class="shop-name">{{ shopInfo.name }}</text>
                <text class="shop-desc">{{ shopInfo.description }}</text>
            </view>
            <view class="shop-status">
                <text :class="['status-tag', shopInfo.status === 1 ? 'active' : 'inactive']">
                    {{ shopInfo.status === 1 ? '营业中' : '已关店' }}
                </text>
            </view>
        </view>

        <!-- 店铺详细信息 -->
        <view class="shop-details">
            <view class="detail-item">
                <text class="label">联系电话</text>
                <text class="value">{{ shopInfo.phone }}</text>
            </view>
            <view class="detail-item">
                <text class="label">营业时间</text>
                <text class="value">{{ shopInfo.businessHours }}</text>
            </view>
            <view class="detail-item">
                <text class="label">店铺地址</text>
                <text class="value">{{ shopInfo.address }}</text>
            </view>
        </view>

        <!-- 快捷操作 -->
        <view class="quick-actions">
            <view class="action-item">
                <image src="/static/icon/edit.png" mode="aspectFit"></image>
                <text>编辑信息</text>
            </view>
            <view class="action-item">
                <image src="/static/icon/product.png" mode="aspectFit" @click="goToProductManagement"></image>
                <text>商品管理</text>
            </view>
           
        </view>
		
    </view>
</template>

<script>
export default {
    data() {
        return {
            shopInfo: {
                name: '美味小厨',
                description: '新鲜美味，值得品尝',
                phone: '13800138000',
                businessHours: '10:00 - 22:00',
                address: '广东省深圳市南山区科技园',
                status: 1
            }
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