<template>
	<view class="navigation-page">
		<!-- 顶部信息卡片 -->
		<view class="info-card">
			<text class="title">{{shopName}}</text>
			<text class="address">{{shopAddress}}</text>
			<text class="time">营业时间：{{shopBusinessHours}}</text>
		</view>

		<!-- 地图组件 -->
		<map id="map" class="map" :latitude="destination.latitude" :longitude="destination.longitude" :markers="markers"
			:polyline="polyline" :show-location="true" scale="16"></map>

		<!-- 底部导航按钮 -->
		<view class="bottom-bar">
			<button class="nav-btn" @click="startNavigation">开始导航</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 目标位置（理发店坐标）
				destination: {
					latitude: 22.5332878113,
					longitude: 114.0286750793
				},
				// 当前位置
				currentLocation: {
					latitude: 0,
					longitude: 0
				},
				// 地图标记点
				markers: [],
				// 导航路线
				polyline: [],
				shopName:'',
				shopAddress:'',
				shopBusinessHours:''
			}
		},
		onLoad() {
			this.initMarkers()
			this.getCurrentLocation()
		},
		methods: {
			// 初始化标记点
			initMarkers() {
				this.markers = [{
					id: 1,
					latitude: this.destination.latitude,
					longitude: this.destination.longitude,
					width: 32,
					height: 32,
					callout: {
						content: '03BarberShop理发工作室',
						color: '#000000',
						fontSize: 14,
						borderRadius: 4,
						padding: 5,
						display: 'ALWAYS'
					}
				}]
			},
			// 获取当前位置
			getCurrentLocation() {
				uni.getLocation({
					type: 'gcj02',
					success: res => {
						this.currentLocation = {
							latitude: res.latitude,
							longitude: res.longitude
						}
					},
					fail: err => {
						uni.showToast({
							title: '获取位置失败，请检查定位权限',
							icon: 'none'
						})
					}
				})
			},
			// 开始导航
			startNavigation() {
				// 检查是否已获取到当前位置
				if (!this.currentLocation.latitude) {
					uni.showToast({
						title: '正在获取位置信息，请稍候',
						icon: 'none'
					})
					return
				}

				uni.request({
					url: 'https://apis.map.qq.com/ws/direction/v1/driving',
					data: {
						key: '36FBZ-7Y5CB-JS6U2-J5MB2-JWN7S-6LFQS', 
						from: `${this.currentLocation.latitude},${this.currentLocation.longitude}`,
						to: `${this.destination.latitude},${this.destination.longitude}`,
						output: 'json'
					},
					success: res => {
						if (res.data.status === 0 && res.data.result.routes.length > 0) {
							this.drawRouteLine(res.data.result.routes[0].legs[0]);
							uni.openLocation({
								latitude: this.destination.latitude,
								longitude: this.destination.longitude,
								shopName: this.shopName,
								shopAddress: this.shopAddress,
								success: () => {
									console.log('导航启动成功');
								}
							});
						} else {
							uni.showToast({
								title: '获取导航路线失败',
								icon: 'none'
							});
						}
					},
					fail: err => {
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					}
				});

			},
			drawRouteLine(path) {
				if (!path || !path.steps) return

				const points = []
				path.steps.forEach(step => {
					const polylinePoints = step.polyline.split(';')
					polylinePoints.forEach(point => {
						const [longitude, latitude] = point.split(',')
						points.push({
							longitude: parseFloat(longitude),
							latitude: parseFloat(latitude)
						})
					})
				})

				this.polyline = [{
					points,
					color: '#1890FF',
					width: 6,
					arrowLine: true
				}]
			}
		},
		onLoad(options){
			console.log(options)
			this.shopName = options.shopName
			this.shopAddress = options.shopAddress
			this.shopBusinessHours=options.shopBusinessHours

		}
	}
</script>

<style lang="scss">
	.navigation-page {
		position: relative;
		width: 100%;
		height: 100vh;

		.info-card {
			position: absolute;
			top: 30rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 90%;
			background-color: #fff;
			border-radius: 16rpx;
			padding: 30rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
			z-index: 10;

			.title {
				display: block;
				font-size: 32rpx;
				font-weight: bold;
				margin-bottom: 16rpx;
			}

			.address {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-bottom: 8rpx;
			}

			.time {
				display: block;
				font-size: 24rpx;
				color: #999;
			}
		}

		.map {
			width: 100%;
			height: 100%;
		}

		.bottom-bar {
			position: absolute;
			bottom: 40rpx;
			left: 0;
			width: 100%;
			padding: 0 40rpx;
			box-sizing: border-box;

			.nav-btn {
				width: 100%;
				height: 88rpx;
				line-height: 88rpx;
				background-color: #1890FF;
				color: #fff;
				font-size: 32rpx;
				border-radius: 44rpx;
				text-align: center;

				&:active {
					opacity: 0.8;
				}
			}
		}
	}
</style>