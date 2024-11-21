<template>
	<view class="container">
		<!-- 搜索框 -->
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

		<view v-for="(item, index) in data " :key="index" class="list-item" @click="todeatils(item)">
			<listVue :tabulatedata="item"></listVue>
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
				uesrInfo: {},
				data: [{
					tabulateId: null,
					tabulateName: "",
					tabulateTabs: [],
					tabulateType: null,
					shop:[{
						shopId:null
					}]
				}]

			};
		},
		methods: {
			search() {
				uni.navigateTo({
					url: "/pages/search/search"
				});
			},
			todeatils(e) {
				const shopInfo = JSON.stringify(e.shopId);
				    
				    uni.navigateTo({
				        url: `/pages/Store-details/Store-details?shop=${encodeURIComponent(shopInfo)}`,
				    });
				
			}
		},
		onLoad() {
			uni.request({
				url: 'http://localhost:8080/tabulate/type/0',
				method: 'GET',
				success: (res) => {
					this.data = res.data.data.map(item => {
						return {
							...item,
							tabulateTabs: item.tabulateTabs ?
								item.tabulateTabs.split(',') : []
						};
					});
					
				},
				fail: (err) => {
				},
				fail: (err) => {
				}
			});
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.userInfo = res.data
					console.log(this.userInfo)
				},
				fail: (err) => {
				},
				fail: (err) => {
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

			text {
				font-size: 32rpx;
				margin: 20rpx 0;
			}
		}
	}
</style>