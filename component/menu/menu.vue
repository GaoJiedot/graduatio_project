<template>
	<view class="container">

		<view class="menu" v-if="userInfo.userType===0">

			<view v-for="(item, index) in adminMenulist" :key="index" class="item" @click="handleAdminMenu(index)">

				<image :src="item.img" alt=""  class="_img"/>

				<text>{{ item.menutext }}</text>
			</view>
		</view>
		<view class="menu" v-if="userInfo.userType===1">

			<view v-for="(item, index) in marketersMenulist" :key="index" class="item"
				@click="handleMarketersMenu(index)">

				<image :src="item.img" alt="" />

				<text>{{ item.menutext }}</text>
			</view>
			<view class="menu0" v-if="userInfo.userType===2">
			</view>
		</view>


	</view>
</template>

<script>
	export default {

		props: {
			userInfo: {
				type: Object,
				default: () => ({
					userType: 0,
					shopId: 0
				}),
			},
		},

		data() {
			return {
				shopStatus: 0,
				adminMenulist: [{
						img: "/static/menuicon/用户.png",
						menutext: "用户管理"
					},
					{
						img: "/static/menuicon/添加.png",
						menutext: "商家管理"
					},
					{
						img: "/static/menuicon/资质.png",
						menutext: "申请管理"
					},
					{
						img: "/static/menuicon/更多.png",
						menutext: "待开发"
					}
				],
				marketersMenulist: [{
						img: "/static/menuicon/店铺.png",
						menutext: "店铺管理"
					},
					{
						img: "/static/menuicon/完成.png",
						menutext: ''
					},
					{
						img: "/static/menuicon/更多.png",
						menutext: "待开发"
					},
					{
						img: "/static/menuicon/更多.png",
						menutext: "待开发"
					}
				]

			};
		},
		methods: {

			handleAdminMenu(index) {
				switch (index) {
					case 0:
						uni.navigateTo({
							url: '/pages/user-management/user-management'
						});
						break;
					case 1:
						uni.navigateTo({
							url: '/pages/merchant-management/merchant-management'
						});
						break;
					case 2:
						uni.navigateTo({
							url: '/pages/apply-management/apply-management'
						});
					default:
						uni.showToast({
							title: '功能开发中',
							icon: 'none',
							duration: 1500,
							mask: true
						});
				}
			},
			handleMarketersMenu(index) {
				switch (index) {
					case 0:
						uni.navigateTo({
							url: '/pages/shop-management/shop-management'
						});
						break;
					case 1:
						this.handleShopStatusToggle()

						break;
					default:
						uni.showToast({
							title: '功能开发中',
							icon: 'none',
							duration: 1500,
							mask: true
						});
				}
			},
			switchShopStatus() {
				if (this.shopStatus === 0) {
					this.marketersMenulist[1].menutext = "一键下班";
					this.shopStatus = 1;
				} else {
					this.marketersMenulist[1].menutext = "一键上班";
					this.shopStatus = 0;
				}
			},
			handleShopStatusToggle() {
				uni.request({
					url: `http://localhost:8080/shop/status`,
					method: 'PATCH',
					data: {
						shopId: this.userInfo.shopId,
						shopStatus: this.shopStatus
					},
					success: (res) => {
						uni.showToast({
							title: res.data.message,
							icon: 'success',
							duration: 2000,
							mask: true
						});
						this.switchShopStatus();
					},
					fail: (err) => {
						console.error('切换店铺状态失败', err);
					}
				});
			}
		},
		created() {
		  if (this.userInfo && this.userInfo.shopId != null) {
		    uni.request({
		      url: `http://localhost:8080/shop/${this.userInfo.shopId}`,
		      method: 'GET',
		      success: (res) => {
		        this.shopStatus = res.data.shopStatus;
		        this.switchShopStatus();
		      },
		      fail: (err) => {
		        console.error('获取店铺状态失败', err);
		      }
		    });
		  } else {
		    console.error('userInfo 未定义或无效');
		  }
		},

		onShow() {
			this.switchShopStatus();
			console.log(this.userInfo)
			console.log(this.shopStatus)
		}

	};
</script>

<style lang="scss" scoped>
	.container {
		margin-top: 15rpx;
		box-shadow: 0px 0px 30px 0 rgba(140, 141, 142, .2);

		.menu0 {}

		.menu {
			display: flex;
			justify-content: space-around;
			width: 100%;
			border-radius: 40rpx;

			.item {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin: 30rpx auto;

				image {
					width: 60rpx;
					height: 60rpx;

				}

				text {

					font-size: 30rpx;
					color: #333;
				}
			}
		}
	}
</style>