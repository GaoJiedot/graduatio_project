<template>
	<view class="appointment-page">


		<!-- 到店时间选择部分 -->
		<view class="arrival-time-section">
			<text class="section-title">到店时间</text>
			<view class="date-options">
				<!-- 循环渲染日期选项 -->
				<view v-for="(date, index) in dates" :key="index" class="date-item" @click="selectDate(index)">
					<text :class="{ 'active': selectedDate === index }">{{ date.label }}</text>
					<text :class="{ 'active': selectedDate === index }">{{ date.date }}</text>
				</view>
			</view>


			<!-- 时间选项部分 -->
			<view class="time-options">
				<!-- 循环渲染时间选项 -->
				<view v-for="(time, index) in selectedDateTimes" :key="index"
					:class="['time-item', time.available ? 'available' : 'unavailable']">
					{{ time.time }}
				</view>
			</view>

			<!-- 如果日期不可用，显示提示信息 -->
			<text class="unavailable-message" v-if="isDateUnavailable">本店该时段暂不接受预约</text>
		</view>

		
		<!-- 预约人信息部分 -->
		<view class="reservation-info-section">
			<text class="section-title">预约人信息</text>

			<view class="input-row">
				<text>手机</text>
				<text>{{ maskedPhone }}</text>
			</view>
		</view>

		<!-- 备注 -->
		<view class="remark-section">
			<input type="text" v-model="remark" placeholder="选填，请输入您的其它要求，最多20字" maxlength="20"></input>
		</view>


		<!-- 提交按钮 -->
		<button class="submit-button" @click="submitReservation">立即预约</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 日期选项
				dates: [{
						label: "今天",
						date: "11-10",
						times: [{
							time: "09:00",
							available: true
						}, {
							time: "12:00",
							available: false
						}, {
							time: "15:00",
							available: true
						}]
					},
					{
						label: "明天",
						date: "11-11",
						times: [{
							time: "10:00",
							available: true
						}, {
							time: "13:00",
							available: true
						}, {
							time: "16:00",
							available: false
						}]
					},
					{
						label: "周二",
						date: "11-12",
						times: [{
							time: "09:00",
							available: true
						}, {
							time: "12:00",
							available: true
						}, {
							time: "17:00",
							available: false
						}]
					},
					{
						label: "周三",
						date: "11-13",
						times: [{
							time: "08:00",
							available: true
						}, {
							time: "11:00",
							available: true
						}, {
							time: "14:00",
							available: false
						}]
					}
				],
				// 选中的日期索引
				selectedDate: 0,
				// 手机号
				phone: "150****1076",
				remark: ""
			};
		},
		computed: {
			maskedPhone() {
				return this.phone;
			},
			selectedDateTimes() {
				return this.dates[this.selectedDate].times;
			}
		},
		methods: {
			selectDate(index) {
				this.selectedDate = index;
			},
			submitReservation() {
				uni.navigateBack({
					
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	.appointment-page {
		padding: 20px;
		background-color: #f8f8f8;

		.arrival-time-section,
		.reservation-info-section,
		.remark-section {
			background-color: #ffffff;
			margin-top: 10px;
			padding: 15px;
			border-radius: 8px;
		}

		.section-title {
			font-size: 16px;
			font-weight: bold;
		}

		.date-options {
			display: flex;
			justify-content: space-around;
			margin-top: 10px;

			.date-item {
				text-align: center;
				cursor: pointer;

				.active {
					color: #ffaf00;
					font-weight: bold;
				}
			}
		}

		.time-options {
			display: flex;
			flex-wrap: wrap;
			margin-top: 10px;
			gap: 8px;

			.time-item {
				padding: 8px 12px;
				border-radius: 4px;
				font-size: 14px;

				&.available {
					background-color: #d1f5d3;
					color: #2b7a2f;
				}

				&.unavailable {
					background-color: #f5d1d1;
					color: #7a2f2f;
				}
			}
		}

		.input-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 10px 0;

			.toggle {
				display: flex;
				align-items: center;
				cursor: pointer;
			}
		}

		.submit-button {
			width: 100%;
			padding: 5px;
			background-color: #28aff6;
			color: white;
			font-size: 16px;
			font-weight: bold;
			border-radius: 8px;
			text-align: center;
			margin-top: 20px;
		}
	}
</style>