<template>
	<view class="user-management-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="header-actions">
				<input class="search-input" placeholder="搜索手机号" confirm-type="search" v-model="searchQuery"
					@confirm="searchUsers" />
				<button class="searchuser" @click="searchUsers">搜索</button>
				<button class="delete-selected" @click="deleteSelectedUsers" :disabled="!hasSelectedUsers">批量删除</button>
			</view>
		</view>

		<!-- 用户列表 -->
		<view class="user-list">
			<!-- 全选复选框 -->
			<checkbox-group @change="toggleSelectAll">
				<label class="select-all">
					<checkbox :value="'all'" :checked="selectAll" />
					<text>全选</text>
				</label>
			</checkbox-group>
			<!-- 单个用户项 -->
			<view v-for="(user, index) in userList" :key="user.userId" class="user-item">
				<checkbox-group @change="(e) => handleSelectionChange(e, user.userId)">
					<label>
						<checkbox :value="user.userId" :checked="isUserSelected(user.userId)"
							:disabled="user.userId === '1'" />
					</label>
				</checkbox-group>
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
					<button class="delete-btn" @click="deleteUser(user)" :disabled="user.userId === '1'">删除</button>
				</view>
			</view>
		</view>
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
	import request from '@/utils/request.js'

	export default {
		data() {
			return {
				userList: [],
				selectedUserIds: [], // 改名以更清晰地表示这是ID数组
				selectAll: false,
				searchQuery: '',
				currentPage: 1,
				totalPages: 1,
				pageSize: 10,
				total: 0
			}
		},
		computed: {
			hasSelectedUsers() {
				return this.selectedUserIds.length > 0;
			},
			selectableUsers() {
				return this.userList.filter(user => user.userId !== '1');
			}
		},
		onPullDownRefresh() {
			this.getuser(1);
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onLoad() {
			this.getuser(this.currentPage);
		},
		methods: {
			isUserSelected(userId) {
				return this.selectedUserIds.indexOf(userId) !== -1;
			},

			toggleSelectAll(e) {
				const isChecked = e.detail.value.length > 0;
				this.selectAll = isChecked;

				if (isChecked) {
					// 选中所有可选用户（排除管理员）
					this.selectedUserIds = this.selectableUsers.map(user => user.userId);
				} else {
					// 取消所有选择
					this.selectedUserIds = [];
				}
			},

			handleSelectionChange(e, userId) {
				if (userId === '1') return; // 跳过管理员

				const isChecked = e.detail.value.length > 0;

				if (isChecked && !this.isUserSelected(userId)) {
					this.selectedUserIds.push(userId);
				} else if (!isChecked) {
					const index = this.selectedUserIds.indexOf(userId);
					if (index > -1) {
						this.selectedUserIds.splice(index, 1);
					}
				}

				// 更新全选状态
				this.selectAll = this.selectableUsers.length > 0 &&
					this.selectedUserIds.length === this.selectableUsers.length;
			},

			deleteSelectedUsers() {
				if (this.selectedUserIds.length === 0) {
					uni.showToast({
						title: '请选择要删除的用户',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '确认删除',
					content: `是否删除选中的 ${this.selectedUserIds.length} 个用户？`,
					success: (res) => {
						if (res.confirm) {
							request.request({
								url: '/user/batch',
								method: 'DELETE',
								data: this.selectedUserIds,
								success: (res) => {
									if (res.data.code === 200) {
										this.getuser(this.currentPage);
										this.selectedUserIds = [];
										this.selectAll = false;

										uni.showToast({
											title: '批量删除成功',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: res.data.message || '删除失败',
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
			getuser(page = 1) {
				request.request({
					url: `/user/admin?page=${page}&limit=${this.pageSize}`,
					method: 'GET',
					success: (res) => {
						if (res.data.code === 200) {
							// 先检查返回的数据结构
							console.log('返回的数据:', res.data.data);

							// 如果返回的是数组
							if (Array.isArray(res.data.data)) {
								this.userList = res.data.data.map(user => ({
									...user,
									userId: user.userId.toString()
								}));
								// 从响应头或其他地方获取分页信息
								this.currentPage = page;
								this.totalPages = Math.ceil(res.data.total / this.pageSize) || 1;
								this.total = res.data.total || this.userList.length;
							}
							// 如果返回的是包含分页信息的对象
							else if (res.data.data && typeof res.data.data === 'object') {
								const pageData = res.data.data;
								this.userList = (pageData.records || []).map(user => ({
									...user,
									userId: user.userId.toString()
								}));
								this.currentPage = pageData.current || page;
								this.totalPages = pageData.pages || 1;
								this.total = pageData.total || this.userList.length;
							}
							// 如果数据格式都不匹配
							else {
								this.userList = [];
								this.currentPage = 1;
								this.totalPages = 1;
								this.total = 0;

								uni.showToast({
									title: '数据格式不正确',
									icon: 'none'
								});
							}

							// 重置选择状态
							this.selectedUsers = {};
							this.selectAll = false;
						} else {
							uni.showToast({
								title: res.data.message || '获取数据失败',
								icon: 'none'
							});
						}
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

			searchUsers() {
				if (!this.searchQuery.trim()) {
					this.getuser(1);
					return;
				}

				request.request({
					url: `/user/userAccount/${this.searchQuery}`,
					method: 'GET',
					success: (res) => {
						if (res.data.code === 200) {
							const searchResult = Array.isArray(res.data.data) ? res.data.data : [res.data
								.data
							];

							this.userList = searchResult.map(user => ({
								...user,
								userId: user.userId?.toString() || ''
							}));

							this.currentPage = 1;
							this.totalPages = 1;
							this.total = this.userList.length;
							this.selectedUsers = {};
							this.selectAll = false;

							if (this.userList.length === 0) {
								uni.showToast({
									title: '未找到匹配的用户',
									icon: 'none'
								});
							}
						}
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

			changePage(direction) {
				const newPage = this.currentPage + direction;
				if (newPage > 0 && newPage <= this.totalPages) {
					this.getuser(newPage);
				}
			},

			editUser(user) {
				uni.navigateTo({
					url: `/pages/edit-user/edit-user?userId=${user.userId}`
				});
			},

			deleteUser(user) {
				uni.showModal({
					title: '确认删除',
					content: `是否删除用户 ${user.userName}？`,
					success: (res) => {
						if (res.confirm) {
							request.request({
								url: `/user/${user.userId}`,
								method: 'DELETE',
								success: (res) => {
									if (res.data.code === 200) {
										// 删除成功后重新加载当前页数据
										this.getuser(this.currentPage);
										uni.showToast({
											title: '删除成功',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: res.data.message || '删除失败',
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
			}
		},
		onLoad() {
			this.getuser();
		},
		watch: {
			searchQuery: {
				handler(newVal, oldVal) {
					if (newVal.trim() !== oldVal.trim()) {
						this.searchUsers();
					}
				},
				immediate: false
			}
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