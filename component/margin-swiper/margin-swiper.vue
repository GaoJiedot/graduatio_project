<template>
	<view class="swiper-container">
		<swiper :indicator-dots="true" 
				:autoplay="true" 
				:interval="3000" 
				:duration="500" 
				indicator-color="#ffffff"
				indicator-active-color="#28aff6" 
				@change="handleSwiperChange">
			<!-- 视频轮播项 -->
			<swiper-item>
				<view class="swiper-item video-item">
					<video 
						id="myVideo" 
						src="/static/ResourceFiles/bgvideo.mp4"
						:autoplay="false"
						:loop="true"
						:muted="true"
						:enable-danmu="false"
						:danmu-btn="false"
						:controls="true"
						:show-center-play-btn="true"
						@error="handleVideoError"
						@loaded="handleVideoLoaded"
						
					></video>
				</view>
			</swiper-item>
			<!-- 图片轮播项 -->
			<swiper-item>
				<view class="swiper-item">
					<image 
						src="/static/ResourceFiles/bg1.jpg"
						mode="aspectFill"
						@error="handleImageError"
					></image>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentIndex: 0,
			isVideoReady: false
		}
	},
	methods: {
		handleVideoError(e) {
			console.error('视频加载错误:', e)
		},
		handleVideoLoaded(e) {
			console.log('视频加载成功')
			this.isVideoReady = true
			if (this.currentIndex === 0) {
				this.playVideo()
			}
		},
		handleImageError(e) {
			console.error('图片加载错误:', e)
		},
		playVideo() {
			if (!this.videoContext) {
				this.videoContext = uni.createVideoContext('myVideo', this)
			}
			setTimeout(() => {
				this.videoContext.play()
			}, 300)
		},
		pauseVideo() {
			if (this.videoContext) {
				this.videoContext.pause()
			}
		},
		handleSwiperChange(e) {
			const newIndex = e.detail.current
			this.currentIndex = newIndex
			
			if (newIndex === 0 && this.isVideoReady) {
				this.playVideo()
			} else {
				this.pauseVideo()
			}
		}
	},
	mounted() {
		this.videoContext = uni.createVideoContext('myVideo', this)
	},
	beforeDestroy() {
		if (this.videoContext) {
			this.pauseVideo()
			this.videoContext = null
		}
	}
}
</script>

<style lang="scss" scoped>
.swiper-container {
	width: 100%;
	height: 400rpx;
	background-color: #f0f0f0;
	
	swiper {
		width: 100%;
		height: 100%;
		
		.swiper-item {
			display: block;
			width: 100%;
			height: 100%;
			border-radius: 15rpx;
			overflow: hidden;
			
			image {
				width: 100%;
				height: 100%;
				border-radius: 15rpx;
			}
			
			&.video-item {
				video {
					width: 100%;
					height: 100%;
					border-radius: 15rpx;
				}
			}
		}
	}
}
</style>