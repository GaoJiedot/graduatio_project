<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo:{}
			};
			
		},
		methods: {
			getuserInfo() {
				uni.request({
					url:`http://localhost:8080/user/userId/${this.userId}`,
					method:'GET',
					success:(res) => {
						this.userInfo=res.data.data
						console.log(this.userInfo)
					}
				})
				
			}
		},
		onLoad(options) {
			console.log(options)
			this.userId=options.userId
			this.getuserInfo()
		},
		
	}
</script>

<style lang="scss">

</style>
