<template>
	<view class="container">
		<view class="box">
			<view class="searchbox">
				<img class="searchicon" src="../../static/icon/搜索框.png" alt="" />
				<input type="text" v-model="searchQuery" placeholder="请输入搜索" @confirm="searchbtn" />
				<img class="delicon" src="../../static/icon/清除.png" alt="" @click="clearaway" />
				<button @click="searchbtn">搜索</button>
			</view>
		</view>

		<!-- 搜索结果列表 -->
		<view class="searchresult" v-if="data.length > 0">
			<view class="searchresult-item" v-for="(item, index) in data" :key="index">
				<listVue :tabulatedata="item" />
			</view>
			<!-- 加载更多组件 -->
			<uni-load-more :status="loadMoreStatus" :content-text="contentText" />
		</view>
		<view class="no-result" v-else-if="hasSearched">
			<text>暂无搜索结果</text>
		</view>
	</view>
</template>

<script>
import listVue from '../../component/list/list.vue';
import request from '@/utils/request.js'
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'

export default {
	components: {
		listVue,
		uniLoadMore
	},

	data() {
		return {
			searchQuery: '',
			data: [],
			hasSearched: false,
			userLocation: {
				latitude: null,
				longitude: null
			},
			// 分页相关
			page: 1,
			pageSize: 10,
			loadMoreStatus: 'more',
			isLoading: false,
			hasMore: true,
			contentText: {
				contentdown: '上拉显示更多',
				contentrefresh: '正在加载...',
				contentnomore: '没有更多数据了'
			}
		}
	},

	methods: {
		clearaway() {
			this.searchQuery = '';
			this.data = [];
			this.hasSearched = true;
			this.resetPagination();
		},

		searchbtn() {
			if (this.searchQuery.trim()) {
				this.resetPagination();
				this.handleSearch();
			} else {
				uni.showToast({
					title: '请输入有效的搜索关键词',
					icon: 'none'
				});
			}
		},

		resetPagination() {
			this.page = 1;
			this.loadMoreStatus = 'more';
			this.isLoading = false;
			this.hasMore = true;
			this.data = [];
		},

		async handleSearch() {
			if (!this.hasMore || this.isLoading) return;

			this.isLoading = true;
			this.loadMoreStatus = 'loading';

			try {
				const response = await this.fetchSearchResults();
				this.processSearchResults(response);
			} catch (err) {
				console.error('搜索失败:', err);
				uni.showToast({
					title: '搜索失败，请稍后重试',
					icon: 'none',
					duration: 2000
				});
				this.loadMoreStatus = 'more';
			} finally {
				this.isLoading = false;
			}
		},

		async fetchSearchResults() {
			const url = `/tabulate/search/${encodeURIComponent(this.searchQuery)}`;
			return new Promise((resolve, reject) => {
				request.request({
					url,
					method: 'GET',
					data: {
						page: this.page,
						pageSize: this.pageSize
					},
					success: (res) => resolve(res),
					fail: (err) => reject(err)
				});
			});
		},

		processSearchResults(response) {
			if (!response.data || !response.data.data) {
				this.handleNoResults();
				return;
			}

			const newData = this.transformSearchResults(response.data.data);
			this.updateSearchResults(newData);
			this.updatePaginationStatus(newData);
			this.hasSearched = true;
		},

		transformSearchResults(results) {
			return results.map(item => ({
				...item,
				tabulateTabs: item.tabulateTabs ? item.tabulateTabs.split(',') : []
			}));
		},

		updateSearchResults(newData) {
			this.data = this.page === 1 ? newData : [...this.data, ...newData];
		},

		updatePaginationStatus(newData) {
			if (newData.length < this.pageSize) {
				this.loadMoreStatus = 'noMore';
				this.hasMore = false;
			} else {
				this.loadMoreStatus = 'more';
				this.page++;
			}
		},

		handleNoResults() {
			if (this.page === 1) {
				this.data = [];
			}
			this.loadMoreStatus = 'noMore';
			this.hasMore = false;
		}
	},

	onLoad(options) {
		if (options.searchQuery) {
			this.searchQuery = options.searchQuery;
			this.handleSearch();
		}
	},

	onReachBottom() {
		if (this.hasMore && !this.isLoading) {
			this.handleSearch();
		}
	}
}
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

	.searchresult {
		padding: 0 20rpx;

		.searchresult-item {
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}

	.no-result {
		text-align: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 28rpx;
	}
}
</style>