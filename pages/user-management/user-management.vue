<template>
    <view class="user-management-container">
        <!-- 页面头部 -->
        <view class="page-header">
            <view class="header-actions">
                <button class="add-btn">+ 添加用户</button>
                <input 
                    class="search-input" 
                    placeholder="搜索用户名/手机号" 
                    confirm-type="search"
                />
            </view>
        </view>

        <!-- 用户列表 -->
        <view class="user-list">
            <view 
                v-for="(user, index) in userList" 
                :key="index" 
                class="user-item"
            >
                <view class="user-avatar">
                    <image :src="user.avatar || '/static/default-avatar.png'" />
                </view>
                <view class="user-info">
                    <view class="user-name">{{ user.username }}</view>
                    <view class="user-phone">{{ user.phone }}</view>
                </view>
                <view class="user-status">
                    <text 
                        :class="['status-tag', user.status === 1 ? 'active' : 'disabled']"
                    >
                        {{ user.status === 1 ? '正常' : '已禁用' }}
                    </text>
                </view>
                <view class="user-actions">
                    <button class="edit-btn">编辑</button>
                    <button class="delete-btn">删除</button>
                </view>
            </view>
        </view>

        <!-- 分页 -->
        <view class="pagination">
            <button class="page-btn prev">上一页</button>
            <text class="page-number">第 1 页 / 共 10 页</text>
            <button class="page-btn next">下一页</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            userList: [
                {
                    username: '张三',
                    phone: '13800138000',
                    status: 1,
                    avatar: ''
                },
                {
                    username: '李四',
                    phone: '13911139111',
                    status: 0,
                    avatar: ''
                }
                // 更多用户数据
            ]
        }
    },
    methods: {
        // 添加用户方法
        addUser() {
            uni.navigateTo({
                url: '/pages/add-user/add-user'
            })
        },
        // 编辑用户方法
        editUser(user) {
            uni.navigateTo({
                url: `/pages/edit-user/edit-user?userId=${user.id}`
            })
        },
        // 删除用户方法
        deleteUser(user) {
            uni.showModal({
                title: '确认删除',
                content: `是否删除用户 ${user.username}？`,
                success: (res) => {
                    if (res.confirm) {
                        // 执行删除逻辑
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.user-management-container {
    padding: 30rpx;
    background-color: #f5f5f5;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;


        .header-actions {
            display: flex;
            align-items: center;

            .add-btn {
                background-color: #4CAF50;
                color: white;
                margin-right: 20rpx;
                padding: 10rpx 20rpx;
                border-radius: 10rpx;
            }

            .search-input {
                border: 1px solid #ddd;
                border-radius: 10rpx;
                padding: 10rpx;
                width: 300rpx;
            }
        }
    }

    .user-list {
        background-color: white;
        border-radius: 15rpx;
        box-shadow: 0 4rpx 6rpx rgba(0,0,0,0.1);

        .user-item {
            display: flex;
            align-items: center;
            padding: 20rpx;
            border-bottom: 1rpx solid #eee;

            .user-avatar {
                margin-right: 20rpx;
                
                image {
                    width: 100rpx;
                    height: 100rpx;
                    border-radius: 50%;
                }
            }

            .user-info {
                flex-grow: 1;

                .user-name {
                    font-size: 32rpx;
                    font-weight: bold;
                }

                .user-phone {
                    color: #666;
                    font-size: 28rpx;
                }
            }

            .user-status {
                .status-tag {
                    padding: 5rpx 15rpx;
                    border-radius: 10rpx;
                    font-size: 24rpx;

                    &.active {
                        background-color: #e6f3ea;
                        color: #4CAF50;
                    }

                    &.disabled {
                        background-color: #fde6e6;
                        color: #f44336;
                    }
                }
            }

            .user-actions {
                display: flex;

                .edit-btn, .delete-btn {
                    margin-left: 10rpx;
                    padding: 10rpx 20rpx;
                    border-radius: 10rpx;
                    font-size: 28rpx;
                }

                .edit-btn {
                    background-color: #2196F3;
                    color: white;
                }

                .delete-btn {
                    background-color: #f44336;
                    color: white;
                }
            }
        }
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 30rpx;

        .page-btn {
            background-color: #4CAF50;
            color: white;
            padding: 10rpx 20rpx;
            margin: 0 20rpx;
            border-radius: 10rpx;
        }

        .page-number {
            color: #666;
        }
    }
}
</style>