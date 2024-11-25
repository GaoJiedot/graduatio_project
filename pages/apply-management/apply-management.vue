<template>
	<view class="container">
		<view class="tabs">
			<view class="header" >
				商家申请
			</view>	
		</view>

		<view class="application-list">
				<view v-for="item in merchantApplications" :key="item.id" class="application-item">
					<view class="application-info">
						<text>商家名称：{{ item.name }}</text>
						<text>联系人：{{ item.contact }}</text>
						<text>电话：{{ item.phone }}</text>
						<text>状态：{{ item.status }}</text>
					</view>
					<view class="application-actions">
						<button v-if="item.status === '待审核'" @click="approveApplication(item, 'merchant')">
							同意
						</button>
						<button v-if="item.status === '待审核'" @click="rejectApplication(item, 'merchant')">
							拒绝
						</button>
					</view>
				</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				merchantApplications: [],	
			}
		},
		onLoad() {
			this.getApplymentList();
		},
		methods: {
			getApplymentList() {
				uni.request({
					url: 'http://localhost:8080/user/admin/1',
					method: 'GET',
					success: (res) => {
						console.log(res.data)
						this.merchantApplications = res.data.data;
					}
				});
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
