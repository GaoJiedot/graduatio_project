<template>
    <view class="merchant-management-container">
        <!-- 顶部搜索和筛选 -->
        <view class="search-bar">
            <view class="search-input">
                <image src="/static/icon/search.png" class="search-icon"></image>
                <input 
                    placeholder="搜索商家名称/联系人" 
                    confirm-type="search"
                    @confirm="searchMerchants"
                />
            </view>
            <view class="filter-icon">
                <image src="/static/icon/filter.png"></image>
            </view>
        </view>

        <!-- 商家列表 -->
        <scroll-view scroll-y class="merchant-list">
            <view 
                v-for="(merchant, index) in merchantList" 
                :key="index" 
                class="merchant-card"
            >
                <view class="merchant-header">
                    <view class="merchant-avatar">
                        <image :src="merchant.avatar" mode="aspectFill"></image>
                    </view>
                    <view class="merchant-basic-info">
                        <text class="merchant-name">{{ merchant.name }}</text>
                        <text class="merchant-contact">{{ merchant.contactPerson }}</text>
                    </view>
                    <view class="merchant-status">
                        <text 
                            :class="[
                                'status-tag', 
                                merchant.status === 1 ? 'active' : 
                                merchant.status === 0 ? 'pending' : 'blocked'
                            ]"
                        >
                            {{ 
                                merchant.status === 1 ? '正常' : 
                                merchant.status === 0 ? '审核中' : '已封禁'
                            }}
                        </text>
                    </view>
                </view>

                <view class="merchant-details">
                    <view class="detail-item">
                        <text class="label">联系电话</text>
                        <text class="value">{{ merchant.phone }}</text>
                    </view>
                    <view class="detail-item">
                        <text class="label">店铺数量</text>
                        <text class="value">{{ merchant.shopCount }}家</text>
                    </view>
                    <view class="detail-item">
                        <text class="label">注册时间</text>
                        <text class="value">{{ merchant.registerDate }}</text>
                    </view>
                </view>

                <view class="merchant-actions">
                    <view 
                        class="action-btn detail"
                        @click="viewMerchantDetails(merchant)"
                    >
                        查看详情
                    </view>
                    <view 
                        class="action-btn manage"
                        @click="manageMerchant(merchant)"
                    >
                        {{ merchant.status === 1 ? '管理' : '审核' }}
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 悬浮添加商家按钮 -->
        <view class="float-add-btn" @click="addNewMerchant">
            <image src="/static/icon/添加 (1).png" mode="aspectFit"></image>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            merchantList: [
                {
                    id: 1,
                    name: '美味餐饮集团',
                    contactPerson: '张三',
                    phone: '13800138000',
                    avatar: '/static/avatar/merchant1.png',
                    status: 1, // 1-正常 0-审核中 2-已封禁
                    shopCount: 5,
                    registerDate: '2023-06-15'
                },
                {
                    id: 2,
                    name: '快乐小吃店',
                    contactPerson: '李四',
                    phone: '13911139111',
                    avatar: '/static/avatar/merchant2.png',
                    status: 0,
                    shopCount: 1,
                    registerDate: '2023-09-22'
                }
                // 更多商家数据
            ]
        }
    },
    methods: {
        // 搜索商家
        searchMerchants(e) {
            const keyword = e.detail.value;
            // 执行搜索逻辑
            console.log('搜索关键词:', keyword);
        },

        // 查看商家详情
        viewMerchantDetails(merchant) {
            uni.navigateTo({
                url: `/pages/merchant-details/merchant-details?merchantId=${merchant.id}`
            });
        },

        // 管理或审核商家
        manageMerchant(merchant) {
            if (merchant.status === 1) {
                // 正常状态，进入管理页面
                uni.navigateTo({
                    url: `/pages/merchant-manage/merchant-manage?merchantId=${merchant.id}`
                });
            } else {
                // 审核状态
                uni.navigateTo({
                    url: `/pages/merchant-audit/merchant-audit?merchantId=${merchant.id}`
                });
            }
        },

        // 添加新商家
        addNewMerchant() {
            uni.navigateTo({
                url: '/pages/add-merchant/add-merchant'
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.merchant-management-container {
    width:auto;
    background-color: #f5f5f5;
    padding: 30rpx;
    position: relative;

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
            box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);

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
	        box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.2);
	
	        image {
	            width: 50rpx;
	            height: 50rpx;
	        }
	    }
}
</style>