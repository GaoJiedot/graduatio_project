<template>
	<view class="user-management-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-actions">
				<input class="search-input" placeholder="搜索用户名/手机号" confirm-type="search" v-model="searchQuery"
					@confirm="searchUsers" />
				<button class="searchuser" @click="searchUsers">搜索</button>
				<button class="delete-selected" @click="deleteSelectedUsers">批量删除</button>
			</view>
		</view>

		<!-- 用户列表 -->
		<view class="user-list">
			<!-- 全选复选框 -->
			<view class="select-all">
				<checkbox :checked="selectAll" @change="toggleSelectAll" />
				<text>全选</text>
			</view>
			<!-- 单个用户项 -->
			<view v-for="(user, index) in userList" :key="user.userId" class="user-item">
				<checkbox class="user-checkbox" :value="user.userId" :model-value="selectedUsers[user.userId]"
					@change="toggleUserSelection(user.userId)" />

				<view class="user-info">
					<view class="user-name">{{ user.userName }}</view>
					<view class="user-phone">{{ user.userAccount }}</view>
				</view>
				<view class="user-status">
					<text
						:class="['status-tag', user.userType === 0 ? 'admin' : (user.userType === 1 ? 'shop' : 'users')]">
						{{ user.userType === 0 ? '管理员' : (user.userType === 1 ? '商家' : '用户') }}
					</text>
				</view>
				<view class="user-actions">
					<button class="edit-btn" @click="editUser(user)">编辑</button>
					<button class="delete-btn" @click="deleteUser(user)">删除</button>
				</view>
			</view>
		</view>

		<!-- 分页 -->
		<view class="pagination">
			<button class="page-btn prev" @click="changePage(-1)" :disabled="currentPage === 1">
				上一页
			</button>
			<text class="page-number">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</text>
			<button class="page-btn next" @click="changePage(1)" :disabled="currentPage === totalPages">
				下一页
			</button>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				userList: [
					{
					userId: null,
					userName: '张三',
					userAccount: 'zhangsan',
					userType: 0,
					}], 
				selectedUsers:{},
				selectAll:false, 
				searchQuery:'', 
				currentPage:1,
				totalPages:1,
				pageSize:10
			}
		},
		methods: {
			// 全选/取消全选
			toggleSelectAll() {
				this.selectAll = !this.selectAll;
				if (this.selectAll) {
					// 将所有用户ID添加到selectedUsers数组中
					this.selectedUsers = this.userList.map(user => user.userId.toString());
				} else {
					// 清空selectedUsers数组
					this.selectedUsers = [];
				}
			},
			toggleUserSelection(userId) {
				this.$set(this.selectedUsers, userId, !this.selectedUsers[userId]); // Vue 的响应式更新
				// 更新全选状态
				this.selectAll = Object.keys(this.selectedUsers).length === this.userList.length &&
					Object.values(this.selectedUsers).every(isSelected => isSelected);
			},
			// 批量删除选中的用户
			deleteSelectedUsers() {
				const selectedIds = Object.keys(this.selectedUsers).filter(id => this.selectedUsers[id]);
				if (selectedIds.length === 0) {
					uni.showToast({
						title: '请先选择要删除的用户',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '确认删除',
					content: `是否删除选中的 ${selectedIds.length} 个用户？`,
					success: (res) => {
						if (res.confirm) {
							uni.request({
								url: `http://localhost:8080/user/delete/batch`,
								method: 'POST',
								data: {
									userIds: selectedIds
								},
								success: (res) => {
									if (res.data.code === 200) {
										this.userList = this.userList.filter(user => !selectedIds
											.includes(user.userId));
										this.selectedUsers = {}; // 重置选中状态
										this.selectAll = false;
										uni.showToast({
											title: '删除成功',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: '删除失败',
											icon: 'none'
										});
									}
								}
							});
						}
					}
				});
			},
			// 编辑单个用户
			editUser(user) {
				uni.navigateTo({
					url: `/pages/edit-user/edit-user?userId=${user.userId}`
				});
			},
			// 删除单个用户
			deleteUser(user) {
				uni.showModal({
					title: '确认删除',
					content: `是否删除用户 ${user.userName}？`,
					success: (res) => {
						if (res.confirm) {
							uni.request({
								url: `http://localhost:8080/user/${user.userId}`,
								method: 'DELETE',
								success: (res) => {
									if (res.data.code === 200) {
										this.userList = this.userList.filter(u => u.userId !== user
											.userId.toString());
										uni.showToast({
											title: '删除成功',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: '删除失败',
											icon: 'none'
										});
									}
								},
								fail: () => {
									uni.showToast({
										title: '请求失败，请稍后再试',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			},
			// 获取用户列表
			getuser(page = 1) {
				uni.request({
					url: `http://localhost:8080/user/admin?page=${page}&limit=${this.pageSize}`,
					method: 'GET',
					success: (res) => {
						this.userList = res.data.data || [];
						// 确保 userId 是字符串
						this.userList = this.userList.map(user => ({
							...user,
							userId: user.userId.toString()
						}));
						// 重置选中状态
						this.selectedUsers = [];
						this.selectAll = false;
						// 更新分页信息（假设后端返回了分页信息）
						this.currentPage = res.data.currentPage || page;
						this.totalPages = res.data.totalPages || 1;
					},
					fail: (err) => {
						console.error('获取用户数据失败:', err);
						uni.showToast({
							title: '请求失败，请检查网络',
							icon: 'none'
						});
					}
				});
			},
			// 搜索用户
			searchUsers() {
				if (!this.searchQuery.trim()) {
					uni.showToast({
						title: '请输入搜索手机号',
						icon: 'none'
					});
					return;
				}
				uni.request({
					url: `http://localhost:8080/user/userAccount/${this.searchQuery}`,
					method: 'GET',
					data: {
						query: this.searchQuery,
						page: this.currentPage,
						limit: this.pageSize
					},
					success: (res) => {
					
						console.log(this.user);
						this.user=res.data.data;
						
						
						this.selectedUsers = [];
						this.selectAll = false;
						// 更新分页信息（假设后端返回了分页信息）
						this.currentPage = res.data.currentPage || 1;
						this.totalPages = res.data.totalPages || 1;
					},
					fail: (err) => {
						console.error('搜索用户失败:', err);
						uni.showToast({
							title: '请求失败，请检查网络',
							icon: 'none'
						});
					}
				});
			},
			// 更改分页
			changePage(direction) {
				const newPage = this.currentPage + direction;
				if (newPage > 0 && newPage <= this.totalPages) {
					this.getuser(newPage);
				}
			}
		},
		onLoad() {
			this.getuser();
		}
	}
</script>
<style lang="scss" scoped>
	.user-management-container {
		padding: 30rpx;
		background-color: #f9fafc;

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

		/* 用户列表样式 */
		.user-list {
			background-color: #fff;
			border-radius: 15rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			overflow: hidden;
			padding: 20rpx;

			.select-all {
				display: flex;
				align-items: center;
				margin-bottom: 20rpx;

				checkbox {
					margin-right: 10rpx;
				}

				text {
					font-size: 28rpx;
					color: #333;
				}
			}

			.user-item {
				display: flex;
				align-items: center;
				padding: 20rpx 30rpx;
				border-bottom: 1rpx solid #f1f1f1;

				&:last-child {
					border-bottom: none;
				}

				.user-checkbox {
					margin-right: 10rpx;
				}

				.user-info {
					flex-grow: 1;

					.user-name {
						font-size: 30rpx;
						font-weight: bold;
						color: #333;
					}

					.user-phone {
						margin-top: 5rpx;
						color: #888;
						font-size: 26rpx;
					}
				}

				.user-status {
					margin-right: 20rpx;

					.status-tag {
						padding: 6rpx 18rpx;
						border-radius: 15rpx;
						font-size: 24rpx;
						font-weight: bold;

						&.admin {
							background-color: #4CAF50;
							color: #ffffff;
						}

						&.shop {
							background-color: #aae2f0;
							color: #ffffff;
						}

						&.users {
							background-color: #e0e0e0;
							color: white;
						}
					}
				}

				.user-actions {
					display: flex;

					button {
						margin-left: 10rpx;
						padding: 8rpx 20rpx;
						border-radius: 15rpx;
						font-size: 24rpx;
						color: #fff;
						cursor: pointer;
						transition: all 0.3s;

						&.edit-btn {
							background-color: #2196F3;

							&:hover {
								background-color: #1e88e5;
							}
						}

						&.delete-btn {
							background-color: #f44336;

							&:hover {
								background-color: #e53935;
							}
						}
					}
				}
			}
		}

		/* 分页样式 */
		.pagination {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 30rpx;

			.page-btn {
				background-color: #4CAF50;
				color: #fff;
				margin: 0 10rpx;
				border-radius: 20rpx;
				font-size: 28rpx;
				cursor: pointer;
				box-shadow: 0 3rpx 6rpx rgba(76, 175, 80, 0.3);
				transition: all 0.3s;

				&:hover {
					background-color: #45a049;
					box-shadow: 0 5rpx 10rpx rgba(76, 175, 80, 0.4);
				}

				&:disabled {
					background-color: #a5d6a7;
					cursor: not-allowed;
					box-shadow: none;
				}
			}

			.page-number {
				color: #666;
				font-size: 28rpx;
			}
		}
	}
</style>