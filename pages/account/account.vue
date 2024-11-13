<template>
	<view class="container">
		<img src="static/我的-B.png" class="avatar" />
		<view class="userbox">
			
			<view class="userbox ">
							<view class="title">用户名</view>
							<input class="uni-input" focus placeholder="请输入新的用户名" />
						</view>			
		</view>
		<button class="submit-btn" @click="submitbtn">保存</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		methods:{
			submitbtn(){
				uni.reLaunch({
					url:"/pages/user/user"
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container{
		
		.avatar {
			display: flex;
			justify-self: center;	
			width: 80px;
			height: 80px;
			border-radius: 50%;
			margin-top: 100rpx;
		}
		.userbox{
			padding: 30rpx;
			input{
				background-color: #fff;
				margin-top: 20rpx	;
			}
		}
		button{
			width: 60%;
			border-radius: 30rpx;
			background-color: #28aff6;
			color:#fff
		}
	}

</style>
