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
		<view v-for="(item, index) in Data" :key="index" class="list-item" @click="todeatils">
			<listVue :data="item" :orderstate=0></listVue>
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

			Data: [{
					id: 1,
					name: 'Item 1'
				},
				{
					id: 2,
					name: 'Item 2'
				},
				{
					id: 3,
					name: 'Item 3'
				},
				{
					id: 4,
					name: 'Item 4'
				},
				{
					id: 5,
					name: 'Item 5'
				},
				{
					id: 6,
					name: 'Item 6'
				},
			],
		};
	},
	onLoad() {
		// 获取用户身份
		this.identity = uni.getStorageSync('identity');
	},
	onShow() {
		// 获取用户身份
		this.identity = uni.getStorageSync('identity');
	},
	// onPullDownRefresh() {
	// 	// 下拉刷新
	// 	uni.stopPullDownRefresh();
	// },
	
	// onReachBottom() {
	// 	// 上拉加载更多
	// 	uni.showLoading({
	// 		title: '加载中'
	// 	});
	// 	setTimeout(() => {
	// 		uni.hideLoading();
	// 	}, 1000);
	// },
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