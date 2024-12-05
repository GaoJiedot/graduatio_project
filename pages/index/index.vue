<template>
	<view class="container" @scrolltolower="onReachBottom" :style="{ height: '100vh', overflow: 'scroll' }">
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

		<view v-if="initialLoading" class="loading-container">
			<uni-load-more status="loading" />
		</view>
		<view v-else-if="error" class="error-container">
			<text>{{ error }}</text>
			<button @click="resetPagination">重试</button>
		</view>

		<template v-else>
			<view v-for="(item, index) in data" :key="index" class="list-item" @click="toDeatils(item)">
				<listVue :tabulatedata="item" :shopId="item.shopId"></listVue>
			</view>

			<uni-load-more  :status="status" />
		</template>
	</view>
</template>

<script>
	import listVue from '../../component/list/list.vue';
	import menuVue from '../../component/menu/menu.vue';
	import marginSwiperVue from 'component/margin-swiper/margin-swiper.vue';
	import request from '@/utils/request.js'
	import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'

	export default {
		components: {
			marginSwiperVue,
			menuVue,
			listVue,
			uniLoadMore
		},
		data() {
			return {
				status: 'more',
				userInfo: {
					userType: null,
					shopId: null,
					userAccount: null // Add userAccount to store
				},
				data: [],
				page: 1,
				pageSize: 5,
				loading: false,
				noMoreData: false,
				error: null,
				initialLoading: true
			}
		},
		methods: {
			search() {
				uni.navigateTo({
					url: "/pages/search/search"
				});
			},
			toDeatils(item) {
				if (!item || !item.shopId) {
					console.error('Invalid item data:', item);
					return;
				}
				uni.navigateTo({
					url: `/pages/Store-details/Store-details?shopId=${item.shopId}&userPhone=${this.userInfo.userAccount || ''}`,
				});
			},
			async getUserInfo() {
				try {
					const res = await uni.getStorage({
						key: 'userInfo'
					});
					this.userInfo = res.data;
					return res.data;
				} catch (err) {
					console.error('获取用户信息失败:', err);
					this.userInfo = {
						userType: null,
						shopId: null,
						userAccount: null
					};
					throw err;
				}
			},
			async getListData() {
				if (this.loading || this.noMoreData) return;

				this.loading = true;
				this.status = 'loading';
				this.error = null;

				try {
					const res = await request.request({
						url: '/tabulate/type/1',
						method: 'GET',
						data: {
							page: this.page,
							pageSize: this.pageSize
						}
					});

					console.log('API Response:', res); // Debug log

					if (!res || !res.data) {
						throw new Error('Invalid response format');
					}

					if (res.data.code === 200) {
						const responseData = Array.isArray(res.data.data) ? res.data.data : [];

						if (responseData.length === 0 && this.page === 1) {
							this.status = 'noMore';
							this.noMoreData = true;
							return;
						}

						const newData = responseData.map(item => ({
							...item,
							tabulateTabs: item.tabulateTabs ? item.tabulateTabs.split(',') : []
						}));

						if (newData.length < this.pageSize) {
							this.noMoreData = true;
							this.status = 'noMore';
						} else {
							this.status = 'more';
						}

						this.data = this.page === 1 ? newData : [...this.data, ...newData];
						this.page += 1;
					} else {
						throw new Error(res.data.message || '获取数据失败');
					}
				} catch (err) {
					console.error('获取列表数据失败:', err);
					this.error = err.message || '获取数据失败，请稍后重试';
					this.status = 'noMore';
				} finally {
					this.loading = false;
					this.initialLoading = false;
				}
			},
			loadMore() {
				if (!this.loading && !this.noMoreData && !this.error) {
					this.getListData();
				}
			},
			async resetPagination() {
				this.page = 1;
				this.data = [];
				this.noMoreData = false;
				this.status = 'more';
				this.error = null;
				this.initialLoading = true;
				await this.getListData();
			}
		},
		async onLoad() {
			try {
				await this.getUserInfo();
				await this.getListData();
			} catch (err) {
				console.error('页面加载失败:', err);
				this.error = '页面加载失败，请稍后重试';
			} finally {
				this.initialLoading = false;
			}
		},
		onReachBottom() {
			console.log('Page reached bottom'); // Debug log
			if (!this.loading && !this.noMoreData && !this.error) {
				this.getListData();
			}
		},
		async onPullDownRefresh() {
			try {
				await this.getUserInfo();
				await this.resetPagination();
			} catch (err) {
				console.error('刷新失败:', err);
				this.error = '刷新失败，请稍后重试';
			} finally {
				uni.stopPullDownRefresh();
			}
		},
		async onShow() {
			await this.getUserInfo();
		}
	};
</script>

<style lang="scss" scoped>
	.container {}

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

	.no-result {
		text-align: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 28rpx;
	}
</style>