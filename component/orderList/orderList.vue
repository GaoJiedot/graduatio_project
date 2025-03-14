<template>
	<view class="container">
		<view class="box1">
			<img :src="orderdata.orderImage" alt="" />
			<view class="content">
				<text>{{orderdata.orderName}}</text>
				<view class="price-container" v-if="orderdata.orderStatus===1">
					<text class="price">{{orderdata.orderPrice}}</text>
				</view>
			</view>
		</view>
		<view class="touse" v-if="orderdata.orderStatus===1">
			<button class="appointment-btn" @click="toapp">去预约</button>
		</view>
		<view class="used" v-if="orderdata.orderStatus===2">
			<view class="used-status">
				<text class="used-icon">✓</text>
				<text>已使用</text>
				<text class="used-date">{{this.orderdata.orderDate}}</text>
			</view>
		</view>
		<view class="touse" v-if="orderdata.orderStatus === 2">
					<button class="appointment-btn" @click="open" :disabled="!!orderdata.orderRating"
						:class="{'rated': !!orderdata.orderRating}">
						{{ orderdata.orderRating ? '已评价' : '去评价' }}
					</button>
				</view>
		<uni-popup ref="popup" type="center" :animation="true">
			<view class="rating-popup">
				<view class="rating-title">
					<text>服务评价</text>
				</view>

				<view class="rating-content">
					<view class="rating-stars">
						<uni-rate :value="rateValue" @change="rateChange" size="25" active-color="#ffd700"
							margin="10" />
					</view>

					<view class="rating-label">
						<text>{{ ratingLabels[rateValue] || '请点击星星评分' }}</text>
					</view>
					<view class="rating-buttons">
						<button class="cancel-btn" @click="closePopup">取消</button>
						<button class="submit-btn" :disabled="!rateValue" @click="submitRating">提交评价</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import timeSlotSelectorVue from '../time-slot-selector/time-slot-selector.vue';
	import uniSection from '../../uni_modules/uni-rate/components/uni-rate/uni-rate.vue'
	import uniRate from '../../uni_modules/uni-rate/components/uni-rate/uni-rate.vue'
	import uniPop from '../../uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import request from '@/utils/request.js'
	export default {
		components: {
			uniRate,
			uniSection,
			uniPop
		},
		props: {
			orderdata: {
				orderId: {
					type: Number,
					required: true
				},
				orderPrice: {
					type: Number,
					required: true
				},
				orderName: {
					type: String,
					required: true
				},
				orderStatus: {
					type: Number,
					required: true

				},
				orderImage: {
					type: String,
					required: true
				},
				shopId: {
					type: Number,
					required: true
				},
				userPhone: {
					type: String,
					required: true
				},
				orderRating: {
				    type: Number,
				    default: 0
				}

			}

		},
		components: {
			timeSlotSelectorVue
		},
		data() {
			return {
				rateValue: 0,
				comment: '',
				ratingLabels: {
					1: '很不满意',
					2: '不满意',
					3: '一般',
					4: '满意',
					5: '非常满意'
				}

			}
		},
		methods: {
			toapp() {
				uni.navigateTo({
					url: `/pages/appointment/appointment?shopId=${this.orderdata.shopId}&userPhone=${this.orderdata.userPhone}&orderId=${this.orderdata.orderId}`
				})
			},
			open() {
				this.$refs.popup.open('center')
			},
			closePopup() {
				this.$refs.popup.close()
			},
			rateChange(e) {
				this.rateValue = e.value
			},
			submitRating() {
				request.request({
					url: `/order/rating/${this.orderdata.orderId}`,
					method: 'PATCH',
					data: {
						orderId: this.orderdata.orderId,
						orderRating: this.rateValue,
						rateStatus: 1
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.updateShopRating()
							this.$emit('update:orderdata', {
								...this.orderdata,
								orderRating: this.rateValue
							});
							uni.showToast({
								title: '评价成功',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '评价失败',
								icon: 'none'
							})
						}
					},
					fail: (err) => {
						uni.showToast({
							title: '网络错误',
							icon: 'none'
						})
					}
				})
				this.closePopup()
			},
			updateShopRating() {
				request.request({
					url: `/order/getRating/${this.orderdata.shopId}`,
					method: 'GET',
					success: (res) => {
						if (res.data && Array.isArray(res.data.data)) {
							const validRatings = res.data.data.filter(order => order.orderRating);

							if (validRatings.length > 0) {
								const totalRating = validRatings.reduce((sum, order) => {
									return sum + order.orderRating;
								}, 0);

								const averageRating = (totalRating / validRatings.length).toFixed(1);

								console.log('店铺平均评分:', averageRating);

								this.updateShopAverageRating(averageRating);
							}
						}
					},
					fail: (err) => {
						console.error('获取评分失败:', err);
					}
				});
			},

			updateShopAverageRating(averageRating) {
				request.request({
					url: `/shop/updateRating/${this.orderdata.shopId}`,
					method: 'PATCH',
					data: {
						shopId: this.orderdata.shopId,
						shopRating: averageRating
					},
					success: (res) => {
						console.log('更新店铺评分成功');
					},
					fail: (err) => {
						console.error('更新店铺评分失败:', err);
					}
				});
			}
		},
		onLoad() {
			this.updateShopRating()
		},
		onShow() {
			this.updateShopRating()
		}


	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		background-color: #ffffff;
		box-shadow: 5px 5px 30px 0 rgba(140, 141, 142, .2);
		border-radius: 15rpx;
		margin-top: 15rpx;
		margin-bottom: 15rpx;
		padding-bottom: 20rpx;
		position: relative;

		.rating-popup {
			width: 600rpx;
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;

			.rating-title {
				text-align: center;
				margin-bottom: 30rpx;

				text {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
			}

			.rating-content {
				.rating-stars {
					display: flex;
					justify-content: center;
					margin: 20rpx 0;
				}

				.rating-label {
					text-align: center;
					margin: 20rpx 0;

					text {
						font-size: 28rpx;
						color: #666;
					}
				}

				.rating-input {
					margin: 30rpx 0;

					.comment-textarea {
						width: 100%;
						height: 200rpx;
						padding: 20rpx;
						box-sizing: border-box;
						border: 2rpx solid #eee;
						border-radius: 10rpx;
						font-size: 28rpx;
					}
				}

				.rating-buttons {
					display: flex;
					justify-content: space-between;
					margin-top: 40rpx;

					button {
						width: 45%;
						height: 80rpx;
						line-height: 80rpx;
						border-radius: 40rpx;
						font-size: 28rpx;
						border: none;

						&.cancel-btn {
							background-color: #f5f5f5;
							color: #666;
						}

						&.submit-btn {
							background: linear-gradient(to right, #3498db, #2980b9);
							color: #fff;

							&:disabled {
								opacity: 0.6;
							}
						}
					}
				}
			}
		}

		.box1 {
			width: 100%;
			height: 200rpx;
			display: flex;

			img {
				width: 200rpx;
				height: 200rpx;
				margin: 20rpx;
				object-fit: contain;
			}

			.content {
				display: flex;
				flex-wrap: wrap;
				gap: 10rpx;
				flex: 1;
				padding: 20rpx 20rpx 20rpx 0;
				position: relative;

				text {
					width: 100%;
					height: 50rpx;
					margin: 10px 0 0 0;
					font-size: 28rpx;
					color: #333;
				}

				.clabal {
					text-align: center;
					height: 35rpx;
					padding: 0 10rpx;
					color: #666;
					border: 1px solid skyblue;
					border-radius: 20rpx;
					font-size: 24rpx;
				}

				.price-container {
					position: absolute;
					bottom: 0;
					left: 0;

					.price {
						color: #ff4d4f;
						font-size: 36rpx;
						font-weight: bold;
						height: auto;
						margin: 0;
						width: auto;

						&::before {
							content: "¥";
							font-size: 24rpx;
							margin-right: 4rpx;
						}
					}
				}
			}
		}


		.touse {
			position: absolute;
			bottom: 20rpx;
			right: 30rpx;

			.appointment-btn {
				background: linear-gradient(to right, #3498db, #2980b9);
				color: #ffffff;
				border: none;
				border-radius: 30rpx;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 26rpx;
				letter-spacing: 2rpx;
				padding: 0 40rpx;
				min-width: 160rpx;
				box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.3);
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.98);
					box-shadow: 0 2rpx 6rpx rgba(52, 152, 219, 0.3);
				}
				&:disabled {
				        opacity: 0.7;
				        cursor: not-allowed;
				        
				        &:active {
				            transform: none;
				        }
				    }
			}
		}


		.used {
			position: absolute;
			top: 20rpx;
			right: 30rpx;

			.used-status {
				display: flex;
				align-items: center;
				gap: 8rpx;
				padding: 8rpx 20rpx;
				background-color: rgba(149, 165, 166, 0.1);
				border-radius: 30rpx;

				.used-icon {
					color: #27ae60;
					font-size: 28rpx;
					font-weight: bold;
				}

				text {
					&:nth-child(2) {
						font-size: 26rpx;
						color: #7f8c8d;
					}

					&.used-date {
						font-size: 24rpx;
						color: #95a5a6;
						margin-left: 10rpx;
					}
				}
			}
		}
	}
</style>