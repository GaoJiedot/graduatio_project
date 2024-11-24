<template>
	<view class="appointment-page">
		<!-- 日期选择 -->
		<view class="date-selection">
			<text class="section-title">选择日期</text>
			<view class="date-options">
				<view v-for="(date, index) in dates" :key="index" class="date-item"
					:class="{ active: selectedDate === index }" @click="selectDate(index)">
					{{ date.label }} ({{ date.date }})
				</view>
			</view>
		</view>

		<!-- 时间段选择 -->
		<view class="time-selection">
			<text class="section-title">选择时间段</text>
			<view class="time-options">
				<view v-for="(time, index) in selectedDateTimes" :key="index" :class="[
			            'time-item',
			            time.available ? 'available' : 'unavailable',
			            time.reserved ? 'reserved' : ''
			        ]" @click="selectTime(index)">
					{{ time.time }} <text v-if="time.reserved">(已预约)</text>
				</view>
			</view>

		</view>
	</view>

	<!-- 提交按钮 -->
	<button class="submit-button" @click="submitReservation">提交预约</button>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				dates: [], // 日期列表
				selectedDate: 0, // 选中的日期索引
				remark: "", // 备注信息
				phone: "150****1076", // 用户手机号
			};
		},
		computed: {
			selectedDateTimes() {
				return this.dates[this.selectedDate]?.times || [];
			},
		},
		onLoad() {
			this.initializeDates();
		},
		methods: {
			// 初始化日期和时间段
			initializeDates() {
				const today = new Date();
				const labels = ["今天", "明天", "后天"];
				this.dates = labels.map((label, i) => {
					const date = new Date(today);
					date.setDate(today.getDate() + i);
					return {
						label,
						date: `${date.getMonth() + 1}-${date.getDate()}`,
						dateString: date.toISOString().split("T")[0],
						times: [{
								time: "10:00-11:00",
								selected: false
							},
							{
								time: "11:00-12:00",
								selected: false
							},
						], // 模拟数据
					};
				});
			},
			// 选择日期
			selectDate(index) {
				this.selectedDate = index;
				this.dates.forEach((_, i) => {
					if (i !== index) {
						this.dates[i].times.forEach((t) => (t.selected = false)); // 重置时间选项
					}
				});
			},
			// 选择时间段
			selectTime(index) {
				const time = this.selectedDateTimes[index];
				if (!time.available || time.reserved) {
					uni.showToast({
						title: "该时间段已被预约",
						icon: "none"
					});
					return;
				}

				this.selectedDateTimes.forEach((t, i) => {
					t.selected = i === index; // 设置选中状态
				});

			},
			// 提交预约
			async submitReservation() {
				const selectedDate = this.dates[this.selectedDate];
				const selectedTime = this.selectedDateTimes.find((t) => t.selected);

				if (!selectedTime) {
					uni.showToast({
						title: "请选择时间段",
						icon: "none"
					});
					return;
				}

				try {
					await uni.request({
						url: "http://localhost:8080/appointments",
						method: "POST",
						data: {
							date: selectedDate.dateString,
							time: selectedTime.time,
							phone: this.phone,
						},
					});
					uni.showToast({
						title: "预约成功",
						icon: "success"
					});
				} catch {
					uni.showToast({
						title: "预约失败，请重试",
						icon: "none"
					});
				}
			},
		},
	};
</script>
<style lang="scss" scoped>
	.appointment-page {
		padding: 20px;
		background-color: #f8f8f8;

		.section-title {
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 10px;
		}

		.date-options,
		.time-options {
			display: flex;
			gap: 10px;
		}

		.date-item,
		.time-item {
			padding: 8px 12px;
			border-radius: 4px;
			font-size: 14px;
			cursor: pointer;

			&.available {
				background-color: #d1f5d3;
				color: #2b7a2f;
			}

			&.unavailable {
				background-color: #f5d1d1;
				color: #7a2f2f;
			}

			&.reserved {
				background-color: #ffe6b3;
				color: #b37400;
				cursor: not-allowed; // 禁止点击
			}
		}


		.submit-button {
			margin-top: 20px;
			width: 100%;
			padding: 10px;
			border-radius: 5px;
			background-color: #007aff;
			color: #fff;
			font-size: 16px;
			text-align: center;
		}
	}
</style>