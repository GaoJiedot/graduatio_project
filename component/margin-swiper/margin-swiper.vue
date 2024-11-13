<template>
	<div class="swiper-container">
		<!-- 轮播图容器 -->
		<swiper :indicator-dots="true" :autoplay="true" :interval="2000" :duration="500" indicator-color="#ffffff"
			indicator-active-color="#28aff6">
			<!-- 轮播图项 -->
			<swiper-item>
				<div class="swiper-item"
					:style="{ backgroundImage: `url(${require('../../static/khl20240930232745242.png')})`, backgroundSize: 'cover' }">
				</div>
			</swiper-item>
			<swiper-item>
				<div class="swiper-item"
					:style="{ backgroundImage: `url(${require('../../static/khl20240930232745242.png')})`, backgroundSize: 'cover' }">
				</div>
			</swiper-item>
		</swiper>
	</div>
</template>

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
				background-repeat: no-repeat;
				background-position: center;
			}
		}
	}
</style>