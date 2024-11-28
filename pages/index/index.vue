<template>
	<view class="container">
		<view class="box">
			<view class="searchbox" @click="search">
				<img src="../../static/icon/搜索框.png" alt="" />
			</view>
		</view>
		<marginSwiperVue></marginSwiperVue>
		<menuVue v-if="userInfo.userType != null" :userInfo="userInfo"></menuVue>

		<view class="mytext">
			<text>为你推荐</text>
		</view>
		<view v-for="(item, index) in data" :key="index" class="list-item" @click="toDeatils(item)">
			<listVue :tabulatedata="item" :shopId="item.shopId"></listVue>
		</view>
	</view>
</template>

<script>
	import listVue from '../../component/list/list.vue';
	import menuVue from '../../component/menu/menu.vue';
	import marginSwiperVue from 'component/margin-swiper/margin-swiper.vue';
	import request from '@/utils/request.js'
	export default {

		components: {
			marginSwiperVue,
			menuVue,
			listVue
		},
		data() {
			return {
				userInfo: {
					userType: null,
					shopId: null
				},
				data: [],
			}
		},
		methods: {
			search() {
				uni.navigateTo({
					url: "/pages/search/search"
				});
			},
			toDeatils(item) {
				uni.navigateTo({
					url: `/pages/Store-details/Store-details?shopId=${item.shopId}&userPhone=${this.userInfo.userAccount}`,
				});
			},
			// 获取用户信息
			getUserInfo() {
				return new Promise((resolve, reject) => {
					uni.getStorage({
						key: 'userInfo',
						success: (res) => {
							this.userInfo = res.data;
							resolve(res.data);
						},
						fail: (err) => {
							console.error('获取用户信息失败:', err);
							this.userInfo = {
								userType: null,
								shopId: null
							};
							reject(err);
						}
					});
				});
			},
			// 获取列表数据
			getListData() {
				request.request({
					url: '/tabulate/type/1',
					method: 'GET',
					success: (res) => {
						if (res.data.code === 200) {
							this.data = res.data.data.map(item => ({
								...item,
								tabulateTabs: item.tabulateTabs ? item.tabulateTabs.split(',') : []
							}));
						}
					},
					fail: (err) => {
						console.error('获取列表数据失败:', err);
					}
				});
			}
		},
		async onLoad() {
			try {
				await this.getUserInfo();
				this.getListData();
			} catch (err) {
				console.error('页面加载失败:', err);
			}
		},
		onShow() {
			this.getUserInfo(); // 每次显示页面时重新获取用户信息
		}
	};
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

				img {
					padding-left: 20rpx;
					width: 50rpx;
					height: 50rpx;
					object-fit: contain;
					align-content: start;
				}
			}
		}
	}

	.mytext {
		text {
			font-size: 32rpx;
			margin: 20rpx 0 10rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.list-item {
		&:hover {
			background-color: #f5f5f5;
		}
	}
</style>