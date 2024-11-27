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

		<view  class="history">
			<view class="history-title">
				<text>搜索历史</text>
				<img src="../../static/icon/del2.png" alt="delete icon" class="icon delete-icon"
					@click="clearHistory" />
			</view>
			<view class="tags" v-if="data.searchHistory && data.searchHistory.length > 0">
				<view v-for="(item, index) in data.searchHistory" :key="index" class="tag">
					{{ item }}
				</view>
			</view>
		</view>

		<view class="hot-search" >
			<view class="hot-title">
				<text>热门搜索</text>
			</view>
			<view class="tags" v-if="data.hotSearchItems && data.hotSearchItems.length > 0">
				<view v-for="(item, index) in data.hotSearchItems" :key="index" class="tag"
					@click="selectHotSearch(item)">
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
				isAdmin: true,
				newHotSearches: "",
				data: {
					searchHistory: [],
					hotSearchItems: [],
					userId: null
				}
			};
		},
		methods: {
			clearaway() {
				this.searchQuery = "";
			},
			clearHistory() {
				this.data.searchHistory = [];
			},
			searchbtn() {
				if (!this.searchQuery.trim()) {
					uni.showToast({
						title: '请输入搜索内容',
						icon: 'none'
					});
					return;
				}

				uni.navigateTo({
					url: `/pages/search-detail/search-detail?searchQuery=${this.searchQuery}`
				});
			},
			getUserHistory() {
				if (!this.data.userId) return;

				uni.request({
					url: `http://localhost:8080/search/history/${this.data.userId}`,
					method: 'GET',
					success: (res) => {
						if (res.data.code === 200 && res.data.data) {
							const data = res.data.data;
							this.data.searchHistory = data.searchHistory ? data.searchHistory.split(',') : [];
							this.data.hotSearchItems = data.searchHot ? data.searchHot.split(',') : [];
						} else {
							// 如果数据为空，初始化为空数组
							this.data.searchHistory = [];
							this.data.hotSearchItems = [];
						}
					},
					fail: () => {
						this.data.searchHistory = [];
						this.data.hotSearchItems = [];
						uni.showToast({
							title: '获取搜索历史失败',
							icon: 'none'
						});
					}
				});
			},
			selectHotSearch(keyword) {
				this.searchQuery = keyword;
				this.searchbtn();
			},
			showHotSearchModal() {
				this.newHotSearches = this.data.hotSearchItems.join(',');
				this.$refs.hotSearchPopup.open();
			},
			cancelHotSearch() {
				this.$refs.hotSearchPopup.close();
			},
			saveHotSearch() {
				uni.request({
					url: 'http://localhost:8080/admin/hot-searches',
					method: 'POST',
					data: {
						hotSearches: this.newHotSearches
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.data.hotSearchItems = this.newHotSearches.split(',');
							uni.showToast({
								title: '设置成功',
								icon: 'success'
							});
						}
						this.$refs.hotSearchPopup.close();
					},
					fail: () => {
						uni.showToast({
							title: '设置失败',
							icon: 'none'
						});
					}
				});
			},
			checkAdminStatus() {
				uni.getStorage({
					key: 'userRole',
					success: (res) => {
						// this.isAdmin = res.data === 'admin';
					}
				});
			}
		},
		onLoad(options) {
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					console.log(res.data);

					this.data.userId = res.data.userId;
					
					this.getUserHistory();
				}
			});
			this.checkAdminStatus();
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
				padding: 0 20rpx;

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
					border-radius: 20rpx;
					outline: none;
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

		.history,
		.hot-search {
			margin-top: 20rpx;
			padding: 40rpx;

			.history-title,
			.hot-title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				text {
					font-size: 30rpx;
				}

				.icon {
					width: 50rpx;
					height: 50rpx;
				}
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
		cursor: pointer;
	}

	.popup-content {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		width: 80%;

		.popup-title {
			font-size: 32rpx;
			text-align: center;
			margin-bottom: 30rpx;
		}

		textarea {
			width: 100%;
			height: 200rpx;
			border: 1rpx solid #ddd;
			padding: 20rpx;
			margin-bottom: 30rpx;
			border-radius: 10rpx;
		}

		.popup-buttons {
			display: flex;
			justify-content: space-around;

			button {
				width: 200rpx;
			}
		}
	}
</style>