<template>
	<view class="container">
		<view class="box">
			<view class="searchbox" @click="search">
				<img src="../../static/icon/搜索框.png" alt="" />
			</view>
		</view>
		<marginSwiperVue></marginSwiperVue>
		<menuVue :userInfo="userInfo"></menuVue>
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

export default {
	components: {
		marginSwiperVue,
		menuVue,
		listVue
	},
	data() {
		return {
			userInfo: {
				userType: 0,
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
		}
	},
	onLoad() {
		uni.request({
			url: 'http://localhost:8080/tabulate/type/1',
			method: 'GET',
			success: (res) => {
				this.data = res.data.data.map(item => {
					return {
						...item,
						tabulateTabs: item.tabulateTabs ?
							item.tabulateTabs.split(',') : []
					};
				});
				console.log('处理后的 data:', this.data);
			},
			fail: (err) => {
				console.error('Request failed:', err);
			}
		});
		uni.getStorage({
			key: 'userInfo',
			success: (res) => {
				this.userInfo = res.data
			},
			fail: (err) => {
				console.error('Storage retrieval failed:', err);
			}
		})
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