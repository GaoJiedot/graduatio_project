<template>
	<view class="appointment-container">
		<view class="header">
			<text class="title">今日预约 ({{todayAppointments.length}})</text>
			<text class="date">{{currentDate}}</text>
		</view>
		<scroll-view scroll-y class="appointment-list">
			<view v-for="(item, index) in todayAppointments" :key="index" class="appointment-item">
				<view class="time-section">
					<text class="time">{{formatTime(item.appointmentTime)}}</text>
				</view>
				<view class="customer-info">
					<view class="phone" @tap="callPhone(item.userPhone)">
						<img src="/static/icon/电话.png" alt="" />
						{{item.userPhone}}
					</view>
				</view>
			</view>

			<view v-if="todayAppointments.length === 0" class="empty-tip">
				<text>今日暂无预约</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				todayAppointments: [],
				currentDate: '',
				shopId: null
			}
		},

		onLoad(options) {
			this.shopId = options.shopId
			console.log('获取到的shopId:', this.shopId)
			this.getCurrentDate()
			this.fetchTodayAppointments()
		},

		methods: {
			getCurrentDate() {
				const date = new Date()
				this.currentDate =
					`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
			},

			async fetchTodayAppointments() {
			    if (!this.shopId) {
			        uni.showToast({
			            title: '店铺ID未获取',
			            icon: 'none'
			        });
			        return;
			    }
			
			    try {
			        uni.request({
			            url: `http://localhost:8080/appointments/reserved/${this.shopId}`,
			            data: {
			                date: this.currentDate
			            },
			            method: 'GET',
			            success: (response) => {
			                if (response.data && response.data.code === 200) {
			                    // 获取数据并排序
			                    this.todayAppointments = (response.data.data || []).sort((a, b) => {
			                        // 只比较小时部分
			                        const hourA = parseInt(a.appointmentTime.split(':')[0], 10);
			                        const hourB = parseInt(b.appointmentTime.split(':')[0], 10);
			                        return hourA - hourB;
			                    });
			
			                    console.log('排序后的预约数据:', this.todayAppointments);
			                } else {
			                    console.log('返回数据异常:', response.data);
			                    uni.showToast({
			                        title: '获取预约列表失败',
			                        icon: 'none'
			                    });
			                }
			            },
			            fail: (error) => {
			                console.log('获取预约列表失败:', error);
			                uni.showToast({
			                    title: '获取预约列表失败',
			                    icon: 'none'
			                });
			            }
			        });
			    } catch (error) {
			        console.log('请求异常:', error);
			        uni.showToast({
			            title: '获取预约列表失败',
			            icon: 'none'
			        });
			    }
			},

			formatTime(time) {
				// 处理时间格式 "11:00"
				return time
			},

			callPhone(phone) {
				uni.makePhoneCall({
					phoneNumber: phone,
					fail(err) {
						console.log('拨打电话失败:', err)
					}
				})
			}
		}
	}
</script>
<style lang="scss" scoped>
.appointment-container {
  height: 100vh; // 固定页面高度
  overflow: hidden; // 禁止滑动
  background: linear-gradient(to bottom, #ffffff, #f2f2f2);

  .header {
    padding: 30rpx;
    background-color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .date {
      font-size: 30rpx;
      color: #888;
    }
  }

  .appointment-list {
    height: calc(100vh - 120rpx); // 减去 header 高度
    overflow-y: scroll; // 仅允许列表部分滚动
    padding: 20rpx;
    box-sizing: border-box;

    .appointment-item {
		margin-left: 20rpx;
      margin-bottom: 20rpx;
      padding: 30rpx;
      background-color: #ffffff;
      border-radius: 16rpx;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      display: flex; // 使用 Flex 布局
      justify-content: space-between; // 左右对齐
      align-items: center; // 垂直居中

      .time-section {
        flex: 1; // 占据左侧空间
        .time {
          font-size: 34rpx;
          font-weight: bold;
          color: #333;
        }
      }

      .customer-info {
        flex: 0; // 固定宽度
        display: flex;
        align-items: center;

        .phone {
          font-size: 28rpx;
          color: #007aff;
          display: flex;
          align-items: center;

          img {
            margin-right: 12rpx;
            width: 40rpx;
            height: 40rpx;
          }
        }
      }
    }

    .empty-tip {
      text-align: center;
      padding: 100rpx 0;
      color: #999;
      font-size: 30rpx;
    }
  }
}
</style>
