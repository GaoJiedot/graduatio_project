<template>
	<view class="container">
		<!-- 搜索框 -->
		<view class="box">
			<view class="searchbox" @click="search">
				<img src="../../static/icon/搜索框.png" alt="" />
			</view>
		</view>
		<!-- 轮播图 -->
		<marginSwiperVue></marginSwiperVue>
		<!-- 菜单 - 根据身份显示 -->
		<menuVue></menuVue>

		<!-- 为你推荐 -->
		<view class="mytext">
			<text>为你推荐</text>
		</view>
		<!-- 循环渲染数据 -->
		<view v-for="(item, index) in data " :key="index" class="list-item" @click="todeatils">
			<listVue :orderdata="data[index]"></listVue>
		</view>
	</view>
</template>

<script>
	import listVue from '../../component/list/list.vue';
	import menuVue from 'component/menu/menu.vue';
	import marginSwiperVue from 'component/margin-swiper/margin-swiper.vue';

	export default {
		components: {
			marginSwiperVue,
			menuVue,
			listVue
		},
		data() {
			return {
				data: [{
					orderName: '',
					orderStatus: '',
					orderId: '',
				}]
			};
		},
		methods: {
			search() {
				uni.navigateTo({
					url: "/pages/search/search"
				});
			},
			todeatils() {
				uni.navigateTo({
					url: "/pages/Store-details/Store-details"
				});
			}
		},
		onLoad() {
			uni.request({
				url: 'http://localhost:8080/order/type/1',
				method: 'GET',
				success: (res) => {
					console.log('Received data:', res);
					this.data = res.data.data;
					console.log(this.data);
				},
				fail: (err) => {
					console.error('Request failed:', err);
				}
			});
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

			text {
				font-size: 32rpx;
				margin: 20rpx 0;
			}
		}
	}
</style>