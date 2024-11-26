<template>
	<view class="container">
		<view class="logo">
			<image :src="this.shopLogo" mode="aspectFit"></image>
		</view>
		<view class="shop-name">
			<text class="name">{{this.shopName}}</text>
		</view>
		<view class="header">
			<text class="title">预约时间:</text>
			<text class="date">{{ today }}</text>
		</view>
		<view class="time-list">
			<view v-for="(time, index) in timeSlots" :key="index" class="time-item"
				@click="!isTimeBooked(time) && selectTime(index)" :class="{ 
					'selected': selectedTime === index,
					'booked': isTimeBooked(time),
				}">
				{{ time }}
				<text v-if="isTimeBooked(time)" class="booked-text">已约</text>
			</view>
		</view>
		<view class="footer">
			<text class="footer-text">预约手机号: {{ userPhone }}</text>
		</view>
		<button class="submit-btn" :disabled="selectedTime === null" @click="submitAppointment">
			确认预约
		</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				today: '',
				timeSlots: [],
				shopId: null,
				shopName: '',
				shopLogo: '',
				selectedTime: null,
				userPhone: null,
				booktime: [] // 存储已预约的时间
			};
		},
		mounted() {
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			this.today = `${year}-${month}-${day}`;

			for (let i = 10; i <= 22; i++) {
				const hour = String(i).padStart(2, '0');
				this.timeSlots.push(`${hour}:00`);
			}
		},
		methods: {
			// 检查时间是否已被预约
			isTimeBooked(time) {
				return this.booktime.some(booking =>
					booking.appointmentDate === this.today &&
					booking.appointmentTime === time
				);
			},
			selectTime(index) {
				const time = this.timeSlots[index];
				if (!this.isTimeBooked(time)) {
					this.selectedTime = index;
				}
			},
			getshopInfo() {
				uni.request({
					url: `http://localhost:8080/shop/${this.shopId}`,
					method: 'GET',
					data: {
						shopId: this.shopId
					},
					success: (res) => {
						console.log(res.data);
						this.shopName = res.data.data.shopName;
						this.shopLogo = res.data.data.shopLogo;
					},
					fail: (err) => {
						console.error(err);
					}
				});
			},
			getappointmentTime() {
				uni.request({
					url: `http://localhost:8080/appointments/reserved/${this.shopId}`,
					method: 'GET',
					data: {
						shopId: this.shopId,
					},
					success: (res) => {
						console.log(res.data);
						this.booktime = res.data.data;
					},
					fail: (err) => {
						console.error(err);
					}
				});
			},
			async submitAppointment() {
				if (this.selectedTime === null) {
					uni.showToast({
						title: '请选择预约时间',
						icon: 'none'
					});
					return;
				}
				const appointmentTime = this.timeSlots[this.selectedTime];
				const appointmentDate = this.today;

				if (this.isTimeBooked(appointmentTime)) {
					uni.showToast({
						title: '该时段已被预约',
						icon: 'none'
					});
					return;
				}

				const appointment = {
					shopId: this.shopId,
					userPhone: this.userPhone,
					appointmentDate,
					appointmentTime
				};
				try {
					const response = await uni.request({
						url: 'http://localhost:8080/appointments',
						method: 'POST',
						data: appointment
					});
					if (response.statusCode === 200) {
						uni.showToast({
							title: '预约成功',
							icon: 'success'
						});
						this.getappointmentTime();
						this.updateOrderStatus();
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
						
					} else {
						uni.showToast({
							title: '预约失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: '预约失败',
						icon: 'none'
					});
				}
			},
			updateOrderStatus() {
				if(this.orderId){
					uni.request({
						url: `http://localhost:8080/order/finishorder/${this.orderId}`,
						method: 'PATCH',
						data: {
							orderId: this.orderId,
							orderStatus:2
						},
						success: (res) => {
							console.log(res.data);
						},
						fail: (err) => {
							console.error(err);
						}
					});
				}
			}
		},
		onLoad(options) {
			console.log(options);
			this.shopId = options.shopId;
			this.userPhone = options.userPhone;
			this.getshopInfo();
			this.getappointmentTime();
		},
		onShow() {
		    const currentPage = getCurrentPages().pop(); 
		    const options = currentPage.options;
		
		    console.log('传递的参数:', options);
		
		    this.shopId = options.shopId;
		    this.userPhone = options.userPhone;
			this.orderId=options.orderId;
			console.log(this.orderId);

		}

	};
</script>

<style scoped lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		background-color: #f4f6f9;
		height: 100vh;

		.logo {
			margin-top: 100rpx;
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 40rpx;

			image {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		.shop-name {
			text-align: center;
			margin-bottom: 40rpx;

			.name {
				font-size: 36rpx;
				font-weight: bold;
				color: #2c3e50;
			}

			.address {
				font-size: 30rpx;
				color: #7f8c8d;
				margin-top: 10rpx;
			}
		}

		.header {
			text-align: center;
			margin-bottom: 40rpx;

			.title {
				font-size: 40rpx;
				font-weight: bold;
				color: #2c3e50;
			}

			.date {
				font-size: 36rpx;
				color: #7f8c8d;
				margin-top: 10rpx;
				margin-left: 10rpx;
			}
		}

		.time-list {
			width: 90%;
			max-width: 600rpx;
			margin-top: 30rpx;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;

			.time-item {
				position: relative;
				width: 30%;
				margin-bottom: 20rpx;
				padding: 20rpx 10rpx;
				text-align: center;
				font-size: 32rpx;
				color: #34495e;
				background: #fff;
				border-radius: 10rpx;
				box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
				transition: all 0.3s ease;

				&.selected {
					background-color: #007aff;
					color: #fff;
					box-shadow: 0 6rpx 12rpx rgba(0, 122, 255, 0.4);
					transform: scale(1.05);
				}

				&.booked {
					background-color: #f5f5f5;
					color: #999;
					cursor: not-allowed;
					pointer-events: none;
				}

				.booked-text {
					position: absolute;
					bottom: 5rpx;
					left: 50%;
					transform: translateX(-50%);
					font-size: 20rpx;
					color: #ff4d4f;
				}

				&:not(.booked):hover {
					background-color: #ecf5ff;
					color: #007aff;
				}
			}
		}

		.submit-btn {
			width: 90%;
			max-width: 600rpx;
			padding: 15rpx;
			margin-top: 30rpx;
			background-color: #007aff;
			color: #fff;
			text-align: center;
			font-size: 32rpx;
			border-radius: 10rpx;
			transition: all 0.3s ease;

			&:disabled {
				background-color: #bdc3c7;
				cursor: not-allowed;
				opacity: 0.7;
			}
		}

		.footer {
			margin-top: 20rpx;
			text-align: center;
			font-size: 30rpx;
			color: #7f8c8d;
		}
	}
</style>