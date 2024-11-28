<template>
	<view class="container">
		<view class="box">
			<view class="searchbox">
				<img class="searchicon" src="../../static/icon/搜索框.png" alt="" />
				<input type="text" v-model="searchQuery" placeholder="请输入搜索" />
				<img v-if="searchQuery" class="delicon" src="../../static/icon/清除.png" alt="" @click="clearaway" />
				<button @click="searchbtn">搜索</button>
			</view>
		</view>

		<view class="history">
			<view class="history-title">
				<text>搜索历史</text>
				<img v-if="data.searchHistory && data.searchHistory.length > 0" src="../../static/icon/del2.png"
					alt="delete icon" class="icon delete-icon" @click="clearHistory" />
			</view>
			<view class="tags" v-if="data.searchHistory && data.searchHistory.length > 0">
				<view v-for="(item, index) in data.searchHistory" :key="index" class="tag"
					@click="selectHistorySearch(item)">
					{{ item }}
				</view>
			</view>
		</view>

		<view class="hot-search">
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
const MAX_HISTORY_ITEMS = 10;
import request from '@/utils/request.js'
export default {
	data() {
		return {
			searchQuery: "",
			data: {
				searchId: null,
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
			if (!this.data.searchId) {
				this.data.searchHistory = [];
				uni.showToast({
					title: '清除历史成功',
					icon: 'success'
				});
				return;
			}

			this.deleteHistory().then(() => {
				this.data.searchHistory = [];
				this.searchQuery=''
				uni.showToast({
					title: '清除历史成功',
					icon: 'success'
				});
			}).catch((error) => {
				console.error('清除历史失败:', error);
				uni.showToast({
					title: '清除历史失败',
					icon: 'none'
				});
			});
		},

		selectHistorySearch(keyword) {
			this.searchQuery = keyword;
			this.searchbtn();
		},

		selectHotSearch(keyword) {
			this.searchQuery = keyword;
			this.searchbtn();
		},

		async searchbtn() {
			const query = this.searchQuery.trim();
			if (!query) {
				uni.showToast({
					title: '请输入搜索内容',
					icon: 'none'
				});
				return;
			}

			try {
				if (this.data.userId) {
					await this.addSearchHistory(query);
					await this.getUserHistory();
				}

				uni.navigateTo({
					url: `/pages/search-detail/search-detail?searchQuery=${encodeURIComponent(query)}`
				});
			} catch (error) {
				console.error('搜索操作失败:', error);
				// 即使保存历史失败，也继续导航
				uni.navigateTo({
					url: `/pages/search-detail/search-detail?searchQuery=${encodeURIComponent(query)}`
				});
			}
		},

		getUserHistory() {
			if (!this.data.userId) {
				return Promise.resolve(); // 没有用户ID时直接返回resolved promise
			}

			return new Promise((resolve, reject) => {
				request.request({
					url: `/search/history/${this.data.userId}`,
					method: 'GET',
					success: (res) => {
						const { code, data } = res.data;
						if (code === 200 && data) {
							this.data.searchHistory = data.searchHistory ? data.searchHistory.split(',') : [];
							this.data.searchId = data.searchId;
							
							resolve();
						} else {
							this.data.searchHistory = [];
							resolve();
						}
					},
					fail: (error) => {
						console.error('获取搜索历史失败:', error);
						this.data.searchHistory = [];
						resolve(); // 失败时也resolve，但清空历史记录
					}
				});
			});
		},

		getSearchHot() {
			return new Promise((resolve, reject) => {
				request.request({
					url: `/search/history/1`,
					method: 'GET',
					success: (res) => {
						const { code, data } = res.data;
						if (code === 200 && data) {
							this.data.hotSearchItems = data.searchHot ? data.searchHot.split(',') : [];
						} else {
							this.data.hotSearchItems = [];
						}
						resolve();
					},
					fail: (error) => {
						console.error('获取热门搜索失败:', error);
						this.data.hotSearchItems = [];
						resolve(); // 失败时也resolve，但清空热门搜索
					}
				});
			});
		},

		deleteHistory() {
			if (!this.data.searchId) {
				return Promise.resolve();
			}

			return new Promise((resolve, reject) => {
				request.request({
					url: `/search/delete/${this.data.searchId}`,
					method: 'DELETE',
					success: (res) => {
						resolve();
					},
					fail: (error) => {
						console.error('删除历史失败:', error);
						reject(error);
					}
				});
			});
		},

		addSearchHistory(keyword) {
		      if (!this.data.userId) {
		        return Promise.resolve();
		      }
		
		      // 构建新的搜索历史字符串
		      let newSearchHistory = keyword;
		      if (this.data.searchHistory && this.data.searchHistory.length > 0) {
		        // 将新关键词添加到现有历史的开头
		        const currentHistory = this.data.searchHistory.filter(item => item !== keyword); // 去除可能存在的重复项
		        if (currentHistory.length >= MAX_HISTORY_ITEMS) {
		          // 如果超过最大数量，移除最后一项
		          currentHistory.pop();
		        }
		        newSearchHistory = [keyword, ...currentHistory].join(',');
		      }
		
		      return new Promise((resolve, reject) => {
		        request.request({
		          url: `/search/add/SearchHistory`,
		          method: 'POST',
		          data: {
		            userId: this.data.userId,
		            searchId: this.data.searchId, // 添加searchId，表明是更新现有记录
		            searchHistory: newSearchHistory
		          },
		          success: (res) => {
		            if (res.data.code === 200) {
		              this.data.searchId = res.data.data.searchId;
		              // 更新本地搜索历史
		              this.data.searchHistory = newSearchHistory.split(',');
		              resolve();
		            } else {
		              console.error('保存搜索历史失败:', res.data);
		              resolve();
		            }
		          },
		          fail: (error) => {
		            console.error('保存搜索历史请求失败:', error);
		            resolve();
		          }
		        });
		      });
		    },

		async initializeData() {
			try {
				const [userInfoRes] = await Promise.all([
					new Promise((resolve) => {
						uni.getStorage({
							key: 'userInfo',
							success: (res) => {
								this.data.userId = res.data.userId;
								resolve();
							},
							fail: (error) => {
								console.error('获取存储的用户信息失败:', error);
								this.data.userId = null;
								resolve();
							}
						});
					})
				]);

				// 并行获取搜索历史和热门搜索
				await Promise.all([
					this.data.userId ? this.getUserHistory() : Promise.resolve(),
					this.getSearchHot()
				]);
			} catch (error) {
				console.error('初始化数据失败:', error);
			}
		}
	},

	async onLoad() {
		await this.initializeData();
	},

	async onShow() {
		if (this.data.userId) {
			await Promise.all([
				this.getUserHistory(),
				this.getSearchHot()
			]);
		} else {
			await this.getSearchHot();
		}
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
</style>