<template>
	<view class="container">
		<view class="box">
			<view class="searchbox">
				<img class="searchicon" src="../../static/icon/搜索框.png" alt="" />
				<input type="text" v-model="searchQuery" placeholder="请输入搜索" />
				<img class="delicon" src="../../static/icon/清除.png" alt="" @click="clearaway" />
				<button @click="searchbtn">搜索</button>
			</view>
		</view>

		<!-- 位置选择区域 -->
		<!-- <view class="location-section" @click="showLocationPicker">
			<view class="location-wrap">
				<img class="location-icon" src="../../static/icon/定位.png" alt="" />
				
				<text class="location-text">{{ currentLocation || '选择位置' }}</text>
			</view>
		</view> -->

		<!-- 搜索结果列表 -->
		<view class="searchresult" v-if="data.length >0">
			<view class="searchresult-item" v-for="(item, index) in data" :key="index">
				<listVue :tabulatedata="item" />
				<!-- :distance="calculateDistance(item.latitude, item.longitude)" -->
			</view>
		</view>
		<view class="no-result" v-else-if="hasSearched">
			<text>暂无搜索结果</text>
		</view>
	</view>
</template>

<script>
	import listVue from '../../component/list/list.vue';

	export default {
		components: {
			listVue
		},

		data() {

			return {
				searchQuery: '',
				data: [{
					tabulateId: null,
					tabulateName: "",
					tabulateTabs: "",
					tabulateType: null
				}],

				currentLocation: '',
				hasSearched: false,
				userLocation: {
					latitude: null,
					longitude: null
				}
			}
		},
		// mounted() {
		// 	this.getUserLocation();
		// },
		methods: {
			clearaway() {
				this.searchQuery = '';
				this.searchResult = [];
				this.hasSearched = true;
			},

			searchbtn() {
				this.handleSearch();
			},

			// // 获取用户位置
			// async getUserLocation() {
			// 	try {
			// 		const [err, res] = await uni.getLocation({
			// 			type: 'gcj02'
			// 		});

			// 		if (err) {
			// 			throw new Error('获取位置失败');
			// 		}

			// 		this.userLocation = {
			// 			latitude: res.latitude,
			// 			longitude: res.longitude
			// 		};
			// 		// 获取位置名称
			// 		this.getLocationName(res.latitude, res.longitude);
			// 	} catch (err) {
			// 		uni.showToast({
			// 			title: '获取位置失败，请手动选择',
			// 			icon: 'none'
			// 		});
			// 	}
			// },

			// // 根据经纬度获取位置名称
			// async getLocationName(latitude, longitude) {
			// 	try {
			// 		const [err, res] = await uni.request({
			// 			url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=36FBZ-7Y5CB-JS6U2-J5MB2-JWN7S-6LFQS`
			// 		});

			// 		if (err) {
			// 			throw new Error('获取位置名称失败');
			// 		}

			// 		if (res.data.status === 0) {
			// 			this.currentLocation = res.data.result.address_component.district;
			// 		}
			// 	} catch (err) {
			// 		console.error('获取位置名称失败:', err);
			// 	}
			// },

			// // 显示位置选择器
			// showLocationPicker() {
			// 	uni.chooseLocation({

			// 		success: (res) => {

			// 			this.currentLocation = res.name;
			// 			this.userLocation = {
			// 				latitude: res.latitude,
			// 				longitude: res.longitude
			// 			};
			// 			// 更新搜索结果
			// 			if (this.searchQuery) {
			// 				this.handleSearch();
			// 			}
			// 		}
			// 	});
			// },

			// // 计算距离
			// calculateDistance(targetLat, targetLng) {
			// 	if (!this.userLocation.latitude || !targetLat) return '';

			// 	const EARTH_RADIUS = 6371;
			// 	const rad = (d) => d * Math.PI / 180.0;

			// 	const radLat1 = rad(this.userLocation.latitude);
			// 	const radLat2 = rad(targetLat);
			// 	const a = radLat1 - radLat2;
			// 	const b = rad(this.userLocation.longitude) - rad(targetLng);

			// 	const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
			// 		Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
			// 	const distance = s * EARTH_RADIUS;

			// 	return distance < 1 ?
			// 		`${(distance * 1000).toFixed(0)}m` :
			// 		`${distance.toFixed(1)}km`;
			// },

			handleSearch() {
				if (!this.searchQuery.trim()) {
					uni.showToast({
						title: '请输入有效的搜索关键词',
						icon: 'none'
					});
					return;
				}

				// if (!this.userLocation.latitude || !this.userLocation.longitude) {
				// 	uni.showToast({
				// 		title: '未获取到位置信息',
				// 		icon: 'none'
				// 	});
				// 	return;
				// }

				uni.showLoading({
					title: '搜索中...'
				});

				const url = `http://localhost:8080/tabulate/search/${encodeURIComponent(this.searchQuery)}`;
				console.log('请求 URL:', url);

				uni.request({
					url: url,
					method: 'GET',
					data: {
						latitude: this.userLocation.latitude,
						longitude: this.userLocation.longitude
					},
					success: (res) => {
						console.log('后端返回的数据:', res.data);
						if (res.data && res.data.data && res.data.data.length > 0) {
							this.data = res.data.data.map(item => ({
								...item,
								tabulateTabs: item.tabulateTabs ? item.tabulateTabs.split(',') : []
							}));
						} else {
							this.data = [];
						}
						this.hasSearched = true;
					},
					fail: (err) => {
						console.error('请求失败:', err);
						uni.showToast({
							title: '搜索失败，请稍后重试',
							icon: 'none'
						});
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},

			// 跳转到详情页
			gotoDetail(id) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${id}`
				});


			}
		},
		onLoad(options) {

			this.searchQuery = options.searchQuery || '';
			this.handleSearch()
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		.box {
			display: flex;
			justify-content: center;
			margin-top: 30rpx;
			margin-bottom: 30rpx;

			.searchbox {
				border-radius: 30rpx;
				background-color: #EEEEEE;
				width: 600rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				padding-left: 20rpx;
				padding-right: 20rpx;

				.searchicon {
					width: 50rpx;
					height: 50rpx;
					margin-right: 10rpx;
				}

				input {
					flex-grow: 1;
					border: none;
					background: transparent;
					font-size: 24rpx;
					color: #333;
					padding-left: 10rpx;
					border-radius: 20rpx;
					outline: none;
					box-sizing: border-box;
				}

				.delicon {
					width: 30rpx;
					height: 30rpx;
					margin-left: 10rpx;
				}

				button {
					width: 140rpx;
					height: 50rpx;
					font-size: 24rpx;
					background-color: #ffffff;
					color: skyblue;
					border: 5rpx solid skyblue;
					border-radius: 40rpx;
					margin-left: 15rpx;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}

		.location-section {
			padding: 20rpx 40rpx;

			.location-wrap {
				display: flex;
				align-items: center;
				background-color: #f8f8f8;
				padding: 20rpx;
				border-radius: 20rpx;

				.location-icon {
					width: 32rpx;
					height: 32rpx;
					margin-right: 10rpx;
				}

				.location-text {
					font-size: 26rpx;
					color: #333;
				}
			}
		}

		.searchresult {
			padding: 0 20rpx;

			.searchresult-item {
				margin-bottom: 20rpx;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}

		.no-result {
			text-align: center;
			padding: 40rpx 0;
			color: #999;
			font-size: 28rpx;
		}
	}
</style>