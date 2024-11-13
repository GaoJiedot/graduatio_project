<template>
	<view class="container">
		<view class="menu0" v-if="identity===0">
		</view>
		<view class="menu" v-if="identity===1">
			
			<view v-for="(item, index) in menulist" :key="index" class="item">
				
				<image :src="item.img" alt="" />
				
				<text>{{ item.menutext }}</text>
			</view>
		</view>
		<view class="menu" v-if="identity===2">
			
			<view v-for="(item, index) in menulist" :key="index" class="item">
				
				<image :src="item.img" alt="" />
				
				<text>{{ item.menutext }}</text>
			</view>
		</view>
		
		
	</view>
</template>

<script>
export default {
	data() {
		return {
		
			menulist: [
				{
					img: "/static/logo.png",
					menutext: "菜单项1"
				},
				{
					img: "/static/logo.png",
					menutext: "菜单项2"
				},
				{
					img: "/static/logo.png",
					menutext: "菜单项3"
				},
				{
					img: "/static/logo.png",
					menutext: "菜单项4"
				}
			],
			identity: 0
		};
	},
	methods: {}
};
</script>

<style lang="scss" scoped>
.container {
	margin-top: 15rpx;
	box-shadow: 0px 0px 30px 0 rgba(140, 141, 142, .2);
	.menu0 {
		
	}
	.menu {
		display: flex;
		justify-content: space-around; 
		width: 100%; 
		border-radius: 40rpx;
		padding: 10rpx;
		
		.item {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin: 30rpx auto;

			image {
				width: 60rpx; 
				height: 60rpx; 
				margin-bottom: 10rpx; 
			}

			text {
				font-size: 30rpx; 
				color: #333;
			}
		}
	}
}
</style>
