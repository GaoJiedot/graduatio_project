<template>
	<view class="container">

		<view class="menu" v-if="userInfo.userType===0">

			<view v-for="(item, index) in adminMenulist" :key="index" class="item">

				<image :src="item.img" alt="" />

				<text>{{ item.menutext }}</text>
			</view>
		</view>
		<view class="menu" v-if="userInfo.userType===1">

			<view v-for="(item, index) in marketersMenulist" :key="index" class="item">

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
				userType: {
					type: Number,
					default: 0
				}
			}
	},
	data() {
			return {

				adminMenulist: [{
						img: "/static/menuicon/用户.png",
						menutext: "用户管理"
					},
					{
						img: "/static/menuicon/添加.png",
						menutext: "商家管理"
					},
					{
						img: "/static/menuicon/更多.png",
						menutext: "待开发"
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
						img: "/static/menuicon/商品.png",
						menutext: "商品管理"
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
		methods: {}
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