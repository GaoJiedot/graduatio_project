<template>
	<view class="container">
		<view class="setHot">
			<button class="setbtn" @click="showPopup">设置热门搜索</button>
		</view>
		<hr>
		<view class="setHotShop">
			<text>设置推荐商家</text>
		</view>

		<!-- 热门搜索设置弹窗 -->
		<uni-popup ref="popup" type="center">
			<view class="popup-content">
				<view class="popup-header">
					<text class="title">设置热门搜索</text>
					<text class="close" @click="hidePopup">×</text>
				</view>
				<view class="popup-body">
					<view class="input-group">
						<input type="text" v-model="currentInput" placeholder="输入搜索关键词"
							@keypress.enter="addHotSearch" />
						<button class="add-btn" @click="addHotSearch">添加</button>
					</view>
					<view class="hot-list">
						<view v-for="(item, index) in hotSearchList" :key="index" class="hot-item">
							<text>{{item}}</text>
							<text class="delete" @click="removeHotSearch(index)">×</text>
						</view>
					</view>
				</view>
				<view class="popup-footer">
					<button class="cancel" @click="hidePopup">取消</button>
					<button class="confirm" @click="saveHotSearch">确认</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				hotSearchList: [],
				currentInput: '',
				originalHotSearch: ''
			};
		},
		methods: {
			showPopup() {
				// 显示弹窗前获取现有热门搜索
				this.getHotSearch();
				this.$refs.popup.open();
			},
			hidePopup() {
				this.$refs.popup.close();
				this.currentInput = '';
			},
			addHotSearch() {
				if (!this.currentInput.trim()) {
					uni.showToast({
						title: '请输入搜索关键词',
						icon: 'none'
					});
					return;
				}

				// 检查是否已存在
				if (this.hotSearchList.includes(this.currentInput.trim())) {
					uni.showToast({
						title: '该关键词已存在',
						icon: 'none'
					});
					return;
				}

				this.hotSearchList.push(this.currentInput.trim());
				this.currentInput = '';
			},
			removeHotSearch(index) {
				this.hotSearchList.splice(index, 1);
			},
			// 获取现有热门搜索
			getHotSearch() {
				// Ensure request is called as a function
				request.request({
					url: '/search/history/1',
					method: 'GET'
				}).then(res => {
					const {
						code,
						data
					} = res.data;
					if (code === 200 && data && data.searchHot) {
						this.originalHotSearch = data.searchHot;
						this.hotSearchList = data.searchHot.split(',');
					}
				}).catch(err => {
					console.error('获取热门搜索失败:', err);
					uni.showToast({
						title: '获取热门搜索失败',
						icon: 'none'
					});
				});
			},
			// 保存热门搜索
			saveHotSearch() {
			            const hotSearchString = this.hotSearchList.join(',');
			            
			            request.request({
			                url: '/search/add/SearchHistory',
			                method: 'POST',
			                data: {
			                    userId: 1,
			                    searchId: 1,
			                    searchHot: hotSearchString
			                }
			            }).then(res => {
			                if (res.data.code === 200) {
			                    uni.showToast({
			                        title: '保存成功',
			                        icon: 'success'
			                    });
			                    this.hidePopup();
			                } else {
			                    uni.showToast({
			                        title: '保存失败',
			                        icon: 'none'
			                    });
			                }
			            }).catch(err => {
			                console.error('保存热门搜索失败:', err);
			                uni.showToast({
			                    title: '保存失败',
			                    icon: 'none'
			                });
			            });
			        }
		}
	};
</script>

<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		background-color: #F5F5F5;

		.setHot {
			margin-top: 100rpx;
			width: 100%;
			height: 100rpx;
			background-color: #FFFFFF;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.setbtn {
			width: 400rpx;
			height: 80rpx;
			background-color: #FF0000;
			color: #FFFFFF;
			text-align: center;
			justify-content: center;
			line-height: 80rpx;
			border-radius: 30rpx;
		}

		hr {
			width: 80%;
			height: 0.5rpx;
			background-color: #F5F5F5;
			text-align: center;
			margin: 80rpx auto;
		}

		.setHotShop {
			width: 100%;
			height: 100rpx;
			background-color: #FFFFFF;
			display: flex;
			margin-left: 20rpx;

			text {
				font-size: 40rpx;
			}
		}
	}

	.popup-content {
		background-color: #FFFFFF;
		width: 600rpx;
		border-radius: 20rpx;

		.popup-header {
			padding: 30rpx;
			border-bottom: 1rpx solid #EEEEEE;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.title {
				font-size: 32rpx;
				font-weight: bold;
			}

			.close {
				font-size: 40rpx;
				color: #999;
				padding: 0 20rpx;
			}
		}

		.popup-body {
			padding: 30rpx;
			max-height: 600rpx;
			overflow-y: auto;

			.input-group {
				display: flex;
				margin-bottom: 30rpx;

				input {
					flex: 1;
					height: 70rpx;
					border: 1rpx solid #EEEEEE;
					border-radius: 10rpx;
					padding: 0 20rpx;
					margin-right: 20rpx;
				}

				.add-btn {
					width: 140rpx;
					height: 70rpx;
					background-color: #FF0000;
					color: #FFFFFF;
					border-radius: 10rpx;
					font-size: 28rpx;
					line-height: 70rpx;
				}
			}

			.hot-list {
				.hot-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 20rpx;
					border-bottom: 1rpx solid #EEEEEE;

					.delete {
						color: #999;
						padding: 0 20rpx;
					}
				}
			}
		}

		.popup-footer {
			padding: 30rpx;
			display: flex;
			justify-content: flex-end;
			border-top: 1rpx solid #EEEEEE;

			button {
				width: 160rpx;
				height: 70rpx;
				border-radius: 10rpx;
				font-size: 28rpx;
				line-height: 70rpx;
				margin-left: 20rpx;
			}

			.cancel {
				background-color: #F5F5F5;
				color: #666;
			}

			.confirm {
				background-color: #FF0000;
				color: #FFFFFF;
			}
		}
	}
</style>