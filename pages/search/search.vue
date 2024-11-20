<template>
	<view class="container">
		<view class="box">

			<view class="searchbox">
				<img class="searchicon" src="../../static/icon/搜索框.png" alt="" />
				<input type="text" v-model="searchQuery" placeholder="请输入搜索" />
				<img class="delicon" src="../../static/icon/清除.png" alt="" @click="clearaway" />
				<button @click="searchbtn">搜索</button>
			</view>
		</view>
		<view v-if="data.searchHistory.length > 0" class="history">
			<view class="history-title">
				<text>搜索历史</text>
				<img src="../../static/icon/del2.png" alt="delete icon" class="icon delete-icon"
					@click="clearHistory" />
			</view>
			<view class="tags">
				<view v-for="(item, index) in data.searchHistory" :key="index" class="tag">
					{{ item }}
				</view>
			</view>
		</view>

		<!-- 热门搜索区域 -->
		<view class="hot-search" v-if="data.hotSearchItems.length > 0">
			<view class="hot-title">
				<text>热门搜索</text>
			</view>
			<view class="tags">
				<view v-for="(item, index) in data.hotSearchItems" :key="index" class="tag" @click="clickhot">
					{{ item }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {

		data() {
			return {

				searchQuery: "",

				data: {
					searchHistory: [],
					hotSearchItems: [],
					userId: null
				}

			};
		},
		methods: {
			clearaway() {
				this.searchQuery = ""
			},
			clearHistory() {
				this.searchHistory = [];
			},
			searchbtn() {
				uni.navigateTo({
					url: `/pages/search-detail/search-detail?searchQuery=${this.searchQuery}`
				})
			}
			// clickhot(e){
			// 	this.searchHistory=e.hotSearchItems
			// }
		},
		onLoad() {
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.data.userId = res.data.userId;
					
				}
			});
			uni.request({
				url: `http://localhost:8080/search/history/${this.data.userId}`,
				method: 'GET',
				success: (res) => {
					if (res.data.code === 200) {
						this.data.searchHistory = res.data.data.searchHistory ?
							res.data.data.searchHistory.split(',') :
							[];
						this.data.hotSearchItems = res.data.data.searchHot ?
							res.data.data.searchHot.split(',') :
							[];
					} else {
						this.data.searchHistory = [];
						this.data.hotSearchItems = [];
					}
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
				padding-left: 20rpx;
				padding-right: 20rpx;

				.searchicon {
					width: 50rpx;
					height: 50rpx;
					margin-right: 10rpx;
				}

				input {
					flex-grow: 1;
					border: none;
					background: transparent;
					font-size: 24rpx;
					color: #333;
					padding-left: 10rpx;
					/* 内部左边距 */
					border-radius: 20rpx;
					outline: none;
					/* 去除聚焦时的默认外边框 */
					box-sizing: border-box;
				}

				.delicon {
					width: 30rpx;
					height: 30rpx;
					margin-left: 10rpx;
				}

				button {
					width: 140rpx;
					height: 50rpx;
					font-size: 24rpx;

					background-color: #ffffff;
					color: skyblue;

					border: 5rpx solid skyblue;

					border-radius: 40rpx;
					margin-left: 15rpx;

					display: flex;
					justify-content: center;
					align-items: center;


				}

			}
		}

		.history {
			margin-top: 20rpx;
			padding: 40rpx;

			.history-title {
				text {
					font-size: 30rpx;
				}

				img {
					width: 30rpx;
					height: 30rpx;
					margin-left: 600rpx;
				}

			}
		}

		.hot-search {
			margin-top: 20rpx;
			padding: 40rpx;

			text {
				font-size: 30rpx;
			}
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.tag {
		padding: 20rpx 30rpx;
		background-color: #eeeeee;
		color: #666;
		border-radius: 30rpx;
		font-size: 24rpx;
	}
</style>