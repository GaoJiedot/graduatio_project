<template>
	<view class="container">

		<view class="tab-header">
			<view v-for="(item, index) in tabs" :key="index" :class="['tab-item', activeTab === index ? 'active' : '']"
				@click="switchTab(index)">
				{{ item }}
			</view>
		</view>


		<view class="tab-content">
			<view v-for="(item, index) in orderdata" :key="index" v-if="activeTab === 0">
				<OrderListVue :orderdata="orderdata[index]"></OrderListVue>
			</view>
			<view v-for="(item, index) in orderdata" :key="index" v-if="activeTab === 1">
				<OrderListVue :orderdata="orderdata[index]"></OrderListVue>
			</view>
		</view>


	</view>
	</view>
</template>
<script>
	import OrderListVue from '../../component/orderList/orderList.vue'
	import request from '@/utils/request.js'
	export default {
		components: {
			OrderListVue
		},
		data() {
			return {
				tabs: ['待使用', '已使用'],
				orderdata: [],
				activeTab: 0,
				userId: null
			};
		},
		onPullDownRefresh() {
			console.log('refresh');
			this.fetchOrderData(this.activeTab + 1);
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			async getUserInfo() {
				return new Promise((resolve, reject) => {
					uni.getStorage({
						key: 'userInfo',
						success: (res) => {
							this.userId = res.data.userId;
							console.log('获取到的用户id', this.userId);
							resolve(res.data.userId);
						},
						fail: (err) => {
							console.error('获取用户信息失败:', err);
							uni.showToast({
								title: '请先登录',
								icon: 'none'
							});
							reject(err);
						}
					});
				});
			},
			// 切换标签页
			switchTab(index) {
				this.activeTab = index;
				this.fetchOrderData(index + 1);
			},
			async fetchOrderData(status) {

				if (!this.userId) {
					try {
						await this.getUserInfo();
					} catch (err) {
						return;
					}
				}

				if (this.userId) {
					request.request({
						url: `/order/status/${status}`,
						method: 'GET',
						data: {
							userId: this.userId,
							status: status
						},
						success: (res) => {
							if (res.data.code === 200) {
								this.orderdata = res.data.data;
								console.log('获取到的数据:', this.orderdata);
							} else {
								uni.showToast({
									title: res.data.msg || '获取数据失败',
									icon: 'none'
								});
							}
						},
						fail: (err) => {
							console.error('Request failed:', err);
							uni.showToast({
								title: '网络请求失败',
								icon: 'none'
							});
						}
					});
				}
			}
		},

		async onLoad() {
			await this.getUserInfo();
			await this.fetchOrderData(1);
		},
		async onShow() {
			 try {
			        await this.getUserInfo();
			        await this.fetchOrderData(this.activeTab + 1);
			    } catch (err) {
			        console.error('onShow error:', err);
			    }
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;

		.tab-header {
			display: flex;
			margin-top: 30rpx;
			border-bottom: 2px solid #ddd;
		}

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 10px;
			color: #666;
			font-size: 16px;
		}

		.tab-item.active {
			color: #28aff6;

			border-bottom: 2px solid #28aff6;

		}

		.tab-content {

			font-size: 14px;
			color: #333;
		}

	}
</style>