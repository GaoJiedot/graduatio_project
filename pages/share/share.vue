<template>
	<view class="community-page">
		<view class="add">
			<img  class="addimg" src="/static/添加.png"  @click="addbtn">
		</view>
		<view v-for="post in posts" :key="post.id" class="post-card">
			<view class="post-header">
				<image class="avatar" :src="post.userAvatar" mode="aspectFill"></image>
				<view class="user-info">
					<text class="nickname">{{ post.userNickname }}</text>
					<text class="post-time">{{ post.postTime }}</text>
				</view>
				<!-- <view class="more-options">
					<uni-icons type="more-filled" size="20" color="#666"></uni-icons>
				</view> -->
			</view>
			<view class="post-content">
				<text class="post-text">{{ post.content }}</text>
			</view>
			<view class="post-images" v-if="post.images.length">
				<image v-for="(image, index) in post.images" :key="index" :src="image" mode="aspectFill"
					@click="previewImage(post.images, index)"></image>
			</view>
			<view class="post-footer">
				<view class="action-btn" @click="likePost(post)">
					<uni-icons :type="post.isLiked ? 'heart-filled' : 'heart'" size="18" :color="post.isLiked ? '#ff6b6b' : '#666'"></uni-icons>
					<text :style="{ color: post.isLiked ? '#ff6b6b' : '#666' }">{{ post.likeCount }}</text>
				</view>
			<!-- 	<view class="action-btn">
					<uni-icons type="chat" size="18" color="#666"></uni-icons>
					<text>{{ post.replyCount }}</text>
				</view>
				<view class="action-btn">
					<uni-icons type="share" size="18" color="#666"></uni-icons>
					<text>分享</text>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				posts: [{
						id: 1,
						userAvatar: '/static/chat/200.jpg',
						userNickname: '设计达人',
						postTime: '10分钟前',
						content: '优秀的设计应该是简洁而有力的。它不仅要美观，更要有内涵和功能性。',
						images: ['/static/goods/2.webp', '/static/goods/3.webp'],
						likeCount: 128,
						replyCount: 32,
						isLiked: false
					},
					{
						id: 2,
						userAvatar: '/static/chat/200.jpg',
						userNickname: '科技爱好者',
						postTime: '1小时前',
						content: '同时也带来了新的挑战。',
						images: ['/static/goods/4.webp', '/static/goods/6.webp'],
						likeCount: 256,
						replyCount: 64,
						isLiked: false
					},
					// 可以添加更多帖子...
				]
			}
		},
		methods: {
			addbtn(){
				uni.navigateTo({
					url: '/pages/add/add'
				})
			},
			previewImage(images, current) {
				uni.previewImage({
					urls: images,
					current: current
				});
			},
			likePost(post) {
				if (post.isLiked) {
					post.likeCount--;
				} else {
					post.likeCount++;
				}
				post.isLiked = !post.isLiked;
			}
		}
	}
</script>

<style scoped>
	@font-face {
		font-family: CustomFont;
		src: url('../../static/uniicons.ttf');
	}

	.community-page {
		background-color: #f4f6f8;
		min-height: 100vh;
		margin-bottom: 30rpx;
	}
	.add{
		padding: 30rpx;
		width:40rpx ;
		
	}
	.addimg{ 
		width: 40rpx;
			height: 40rpx;
			position: absolute;
			top: 10rpx;
			right: 50rpx;
		
	}

	.post-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.post-header {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.user-info {
		flex: 1;
	}

	.nickname {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.post-time {
		font-size: 24rpx;
		color: #999;
		margin-top: 4rpx;
	}

	.more-options {
		padding: 10rpx;
	}

	.post-content {
		padding: 20rpx;
	}

	.post-text {
		font-size: 28rpx;
		line-height: 1.6;
		color: #333;
	}

	.post-images {
		display: flex;
		flex-wrap: wrap;
		padding: 0 20rpx 20rpx;
	}

	.post-images image {
		width: calc(33.33% - 10rpx);
		height: 200rpx;
		margin-right: 10rpx;
		margin-bottom: 10rpx;
		border-radius: 8rpx;
	}

	.post-images image:nth-child(3n) {
		margin-right: 0;
	}

	.post-footer {
		display: flex;
		justify-content: space-around;
		padding: 20rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.action-btn {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
	}

	.action-btn text {
		font-size: 24rpx;
		color: #666;
		margin-left: 10rpx;
	}
</style>