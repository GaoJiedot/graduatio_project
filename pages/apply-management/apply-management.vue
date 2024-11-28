<template>
	<view class="container">
		<view class="tabs">
			<view class="header">
				商家申请
			</view>
		</view>
		<view class="application-list">
			<view v-for="item in merchantApplications" :key="item.shopId" class="application-item">
				<view class="application-info">
					<text>商家名称：{{ item.shopName}}</text>
					<text>联系人：{{ item.shopKeeper }}</text>
					<text>电话：{{ item.shopId }}</text>
				</view>
				<view class="application-actions">
					<button @click="approveApplication(item)">
						同意
					</button>
					<button @click="rejectApplication(item)">
						拒绝
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
export default {
	data() {
		return {
			merchantApplications: [],
			shopId: null
		}
	},
	onLoad() {
		this.getApplymentList();
	},
	methods: {
		getApplymentList() {
			request.request({
				url: '/temporary/admin',
				method: 'GET',
				success: (res) => {
					console.log(res.data);
					this.merchantApplications = res.data.data;
				},
				fail: (err) => {
					console.error(err);
					uni.showToast({
						title: '获取申请列表失败',
						icon: 'none'
					});
				}
			});
		},
		async approveApplication(item) {
			try {
				// First create the shop
				const shopResponse = await uni.request({
					url: `/shop`,
					method: 'POST',
					data: {
						...item
					}
				});

				if (!shopResponse.data.data?.shopId) {
					throw new Error('Shop creation failed - no shopId returned');
				}

				const newShopId = shopResponse.data.data.shopId;

				// Then update the user type and shop ID
				const updateResponse = await request.request({
					url: `/user/updateApply/${item.userId}`,
					method: 'PATCH',
					data: {
						userType: 1,  // Make sure this matches your expected enum/constant
						shopId: newShopId
					}
				});

				if (updateResponse.statusCode === 200) {
					// If successful, remove the application and refresh the list
					await this.rejectApplication(item);
					await this.getApplymentList();
					
					uni.showToast({
						title: '审批成功',
						icon: 'success'
					});
				} else {
					throw new Error('User update failed');
				}
			} catch (err) {
				console.error('Approval process failed:', err);
				uni.showToast({
					title: '审批失败',
					icon: 'none'
				});
			}
		},
		rejectApplication(item) {
			request.request({
				url: `/temporary/admin/${item.shopId}`,
				method: 'DELETE',
				success: (res) => {
					console.log(res.data);
					this.getApplymentList();
					uni.showToast({
						title: '操作成功',
						icon: 'success'
					});
				},
				fail: (err) => {
					console.error(err);
					uni.showToast({
						title: '删除申请失败',
						icon: 'none'
					});
				}
			})
		}
	}
}
</script>

<style scoped lang="scss">
	.container {
		padding: 30rpx;
		background-color: #f0f2f5;
		min-height: 100vh;
	}

	.tabs {
		display: flex;
		justify-content: space-around;
		background-color: #ffffff;
		border-radius: 15rpx;
		box-shadow: 0 5rpx 10rpx rgba(0, 0, 0, 0.1);
		padding: 20rpx;
		margin-bottom: 30rpx;

		.tab {
			flex: 1;
			text-align: center;
			padding: 15rpx 0;
			font-size: 32rpx;
			font-weight: 600;
			color: #555;
			border-radius: 10rpx;
			transition: background-color 0.3s, color 0.3s;

			&.active {
				background-color: #007bff;
				color: white;
			}

			&:hover {
				background-color: #e6f0ff;
				color: #007bff;
			}
		}
	}

	.application-list {
		background-color: white;
		border-radius: 15rpx;
		padding: 20rpx;
		box-shadow: 0 5rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.application-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		margin-bottom: 10rpx;
		border-radius: 10rpx;
		border: 1px solid #f0f0f0;
		background-color: #fafafa;
		box-shadow: 0 3rpx 6rpx rgba(0, 0, 0, 0.05);

		&:hover {
			box-shadow: 0 5rpx 12rpx rgba(0, 0, 0, 0.1);
			background-color: #f9f9f9;
		}
	}

	.application-info {
		display: flex;
		flex-direction: column;
		gap: 10rpx;

		text {
			font-size: 28rpx;
			color: #333;
			line-height: 1.5;
		}
	}

	.application-actions {
		display: flex;
		gap: 10rpx;

		button {
			padding: 10rpx 25rpx;
			font-size: 28rpx;
			color: white;
			background-color: #4CAF50;
			border: none;
			border-radius: 8rpx;
			cursor: pointer;
			transition: background-color 0.3s;

			&:nth-child(2) {
				background-color: #FF5722;
			}

			&:hover {
				filter: brightness(1.2);
			}

			&:active {
				filter: brightness(0.9);
			}
		}
	}
</style>