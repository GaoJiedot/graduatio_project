<template>
	<view class="container1">
		<!-- 时间段显示 -->
		<view class="time-slot-display">
			<!-- 时间段列表 -->
			<view class="time-slots" scroll-x="true" show-scrollbar="false">
				<!-- 时间段容器 -->
				<view class="slot-container">
					<!-- 遍历时间段 -->
					<view v-for="slot in timeSlots" :key="slot" class="time-slot"
						:class="isBooked(slot) ? 'booked' : 'available'">
						<!-- 时间段数字 -->
						<text class="slot-number">{{ slot }}</text>
					</view>
				</view>
			</view>
			<!-- 图例 -->
			<view class="legend">
				<!-- 已预订时段 -->
				<view class="legend-item">
					<view class="legend-color booked"></view>
					<text>已预订时段</text>
				</view>
				<!-- 可预订时段 -->
				<view class="legend-item">
					<view class="legend-color available"></view>
					<text>可预订时段</text>
				</view>
				<!-- 预约按钮 -->
				<button class="submit-btn">进店</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props:{
		shopId: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			bookedSlots: [],
			timeSlots: Array.from({length: 13}, (_, i) => i + 10),
		}
	},
	methods: {
		isBooked(slot) {
			return this.bookedSlots.includes(slot)
		},
		async fetchBookedSlots() {
			try {
				const response = await uni.request({
					url: `http://localhost:8080/appointments/reserved/${this.shopId}`,
					method: 'GET'
				});
				
				// 确保返回的数据存在且是数组
				if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
					// 从返回的数据中提取appointmentTime并转换为数字
					this.bookedSlots = response.data.data.map(appointment => {
						// 提取小时数并转换为数字
						return parseInt(appointment.appointmentTime.split(':')[0]);
					});
					console.log('预约时间段已更新:', this.bookedSlots);
				} else {
					console.error('返回数据格式不正确:', response.data);
				}
			} catch (error) {
				console.error("获取预约时间失败：", error);
			}
		}
	},
	created() {
		// 在组件创建时获取预约数据
		this.fetchBookedSlots();
	}
}
</script>

<style lang="scss" scoped>
	.container1 {
		width: 100%;
		height: 150rpx;
		display: flex;
		justify-content: center;
		margin-top: 50rpx;
		box-sizing: border-box;
		.time-slot-display {
			border-radius: 16rpx;
			width: 100%;
			max-width: 700rpx;
			height: 150rpx;
			.time-slots {
				width: 100%;
				white-space: nowrap;
				border-radius: 12rpx;
				.slot-container {
					width: 100%;
					display: inline-flex;
					padding: 0;
					justify-content: center;
				}
				.time-slot {
					width: 40rpx;
					height: 40rpx;
					margin-right: 5rpx;
					border-radius: 8rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					&:last-child {
						margin-right: 10rpx;
					}
					&.booked {
						background: linear-gradient(145deg, #ff9966, #ff5e62);
						.slot-number {
							color: #FFFFFF;
						}
					}
					&.available {
						background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
						.slot-number {
							color: #475569;
						}
					}
					.slot-number {
						font-size: 26rpx;
						font-weight: 500;
					}
				}
			}
			.legend {
				display: flex;
				align-items: center;
				padding: 20rpx 10rpx 0;
				.legend-item {
					display: flex;
					align-items: center;
					margin-right: 50rpx;
					margin-left: 30rpx;
					text {
						font-size: 24rpx;
						color: #64748b;
					}
				}
				.legend-color {
					width: 24rpx;
					height: 24rpx;
					border-radius: 6rpx;
					margin-right: 12rpx;
					&.booked {
						background: linear-gradient(145deg, #ff9966, #ff5e62);
					}
					&.available {
						background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
					}
				}
				.submit-btn {
					margin-left: auto;
					width: 140rpx;
					height: 60rpx;
					line-height: 60rpx;
					font-size: 28rpx;
					background: #3b82f6;
					color: #FFFFFF;
					border-radius: 30rpx;
					padding: 0 20rpx;
				}
			}
		}
	}
</style>