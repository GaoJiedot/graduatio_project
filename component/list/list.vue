<template>
	<view class="container">
		<!-- 第一个盒子 -->
		<view class="box1">
			<!-- 图片 -->
			<img src="/static/logo.png" alt="" />
			<!-- 内容 -->
			<view class="content">
				<text>{{orderdata.orderName}}</text>

				<!-- 遍历alabal数组，根据orderstate的值判断是否显示 -->
				<view v-for="(tab, index) in orderdata.orderTabs" :key="index" class="clabal"
					v-if="orderdata.orderstatus===0">
					<!-- {{ordertab}} -->
				</view>

				<!-- 根据orderstate的值判断是否显示价格 -->
				<view class="price-container" v-if="orderdata.orderStatus===1">
					<text class="price">¥{{orderdata.orderPrice}}</text>
				</view>
			</view>
		</view>

		<!-- 根据orderstate的值判断是否显示时间选择器 -->
		<view class="atime" v-if="orderdata.orderStatus===0">
			<timeSlotSelectorVue></timeSlotSelectorVue>
		</view>


		<!-- 根据orderstate的值判断是否显示预约按钮 -->
		<view class="touse" v-if="orderdata.orderStatus===1">
			<button class="appointment-btn">去预约</button>
		</view>


		<!-- 根据orderstate的值判断是否显示已使用状态 -->
		<view class="used" v-if="orderdata.orderStatus===2">
			<view class="used-status">
				<text class="used-icon">✓</text>
				<text>已使用</text>
				<text class="used-date">2024-11-12</text>
			</view>
		</view>
	</view>
</template>

<script>
	import timeSlotSelectorVue from '../time-slot-selector/time-slot-selector.vue';
	export default {
		props: {
			orderdata: {

				orderName: {
					type: String,
					required: true
				},
				orderTabs: {
					type: Array,
					required: true
				},
				orderPrice: {
					type: Number,
					required: true
				},
				orderstatus: {
					type: Number,
					required: true

				}
			}

		},
		components: {
			timeSlotSelectorVue
		},
		data() {
			return {


			}
		},
		methods: {
			
		},
		mounted() {
			console.log(this.orderdata.orderstatus)
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