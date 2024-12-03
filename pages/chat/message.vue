<template>
	<view class="chat-container">
		<scroll-view class="message-scroll" scroll-y :scroll-top="scrollTop" :scroll-with-animation="true"
			@scroll="handleScroll">
			<view class="message-list">
				<view class="message-item" :class="[item.senderId === userId ? 'message-right' : 'message-left']"
					v-for="(item, index) in messageList" :key="index">
					<!-- 左侧消息 -->
					<template v-if="item.senderId !== userId">
						<view class="avatar-wrap">
							<image :src="item.userAvatar" class="avatar" mode="aspectFill" />
						</view>
						<view class="message-content-wrap">
							<view class="sender-name">{{item.userName}}</view>
							<view class="message-bubble" :class="{'image-message': item.type === 'image'}">
								<image v-if="item.type === 'image'" :src="item.content" mode="widthFix"
									@tap="previewImage(item.content)" class="message-image" />
								<text v-else class="message-text">{{ item.content }}</text>
							</view>
							<text class="message-time">{{ formatTime(item.sendTime) }}</text>
						</view>
					</template>

					<!-- 右侧消息 -->
					<template v-else>
						<view class="message-content-wrap right">
							<view class="sender-name">{{item.userName}}</view>
							<view class="message-bubble" :class="{'image-message': item.type === 'image'}">
								<image v-if="item.type === 'image'" :src="item.content" mode="widthFix"
									@tap="previewImage(item.content)" class="message-image" />
								<text v-else class="message-text">{{ item.content }}</text>
							</view>
							<text class="message-time">{{ formatTime(item.sendTime) }}</text>
						</view>
						<view class="avatar-wrap right">
							<image :src="item.userAvatar" class="avatar" mode="aspectFill" />
						</view>
					</template>
				</view>
			</view>
		</scroll-view>
		<view class="input-area">
			<view class="input-container">
				<input type="text" v-model="content" class="message-input" @confirm="sendMessage"
					placeholder="请输入消息..." />
				<view class="action-buttons">
					<view class="image-btn" @tap="chooseImage">
						<image src="/static/icon/添加.png" mode="aspectFit" class="action-icon" />
					</view>
					<button class="send-btn" :class="{'send-btn-active': content.trim()}" @tap="sendMessage"
						:disabled="!content.trim()">
						发送
					</button>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	const WS_URL = `ws://localhost:8080/websocket/`;
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				content: '',
				scrollTop: 0,
				messageList: [{
					userId: null,
					userName: '',
					userAvatar: '',
					friendId: '',
					friendName: '',
					friendAvatar: '',
					senderId: null,
					content: '你好，我是商家',
					type: 'text',
					sendTime: new Date().getTime(),
					readStatus: false,
				}],
				userId: null,
				userName: '',
				userAvatar: '',
				friendId: null,
				friendName: '',
				friendAvatar: '',
				shopId: null,
				isAutoScroll: true,
				lastScrollTop: 0,
				websocket: null,
				type: 'text'

			};
		},

		async onLoad(options) {
			console.log('Loaded with options:', options);

			await this.getUserInfo();

			// Then handle shop or direct friend connection
			if (options.shopId) {
				this.shopId = options.shopId;
				await this.getFriendInfo();
			} else if (options.friendId) {
				this.friendId = options.friendId;
				this.friendName = options.friendName;
				this.friendAvatar = options.friendAvatar;
			}

			if (this.friendId) {
				this.selectChat();
			} else {
				console.error('No friendId available after initialization');
				uni.showToast({
					title: '无法获取联系人信息',
					icon: 'none'
				});
			}
		},
		onUnload() {
			this.closeWebSocket()
		},

		methods: {
			handleScroll(e) {
				const scrollTop = e.detail.scrollTop;
				if (Math.abs(scrollTop - this.lastScrollTop) > 100) {
					this.isAutoScroll = false;
				}
				this.lastScrollTop = scrollTop;
			},
			getUserInfo() {
				return new Promise((resolve) => {
					uni.getStorage({
						key: 'userInfo',
						success: res => {
							console.log("Current user info:", res.data);
							this.userId = res.data.userId;
							this.userName = res.data.userName;
							this.userAvatar = res.data.userAvatar;
							resolve();
						},
						fail: err => {
							console.error('Failed to get user info:', err);
							uni.showToast({
								title: '获取用户信息失败',
								icon: 'none'
							});
							resolve();
						}
					});
				});
			},
			getFriendInfo() {
				return new Promise((resolve) => {
					if (!this.shopId) {
						console.error('No shopId available');
						resolve();
						return;
					}

					request.request({
						url: `/user/getFriendId/${this.shopId}`,
						method: 'GET',
						success: res => {
							console.log("Friend info:", res.data.data);
							if (res.data.data) {
								this.friendId = res.data.data.userId;
								this.friendName = res.data.data.userName;
								this.friendAvatar = res.data.data.userAvatar;

							}
							resolve();
						},
						fail: err => {
							console.error('Failed to get friend info:', err);
							uni.showToast({
								title: '获取好友信息失败',
								icon: 'none'
							});
							resolve();

						}
					});
				});
			},
			selectChat() {
				if (!this.friendId) {
					console.error('friendId is undefined or null!');
					return;
				}
				request.request({
					url: `/chat/getHistoryChat/${this.userId}/${this.friendId}`,
					method: 'GET',
					success: res => {
						if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
							this.messageList = res.data.data;
							this.initWebSocket();

						} else {
							this.createChatList();
							this.createChat();
						}
					},
					fail: err => {
						console.error('获取聊天历史失败:', err);
						uni.showToast({
							title: '获取聊天记录失败',
							icon: 'none'
						});
					}
				})
			},
			initWebSocket() {
				if (this.websocket) {
					this.closeWebSocket();
				}
				try {
					this.websocket = uni.connectSocket({
						url: `${WS_URL}${this.userId}`,
						success: () => {},
					})
					this.websocket.onOpen(() => {
						console.log("WebSocket连接已打开")
						const initMessage = {
							type: 'init',
							data: {
								userId: this.userId,
								friendId: this.friendId,
							}
						}
						this.websocket.send({
							type: 'init',
							data: JSON.stringify(initMessage)
						})
					})
					this.websocket.onMessage((res) => {
						console.log("收到消息", res)
						const message = JSON.parse(res.data)
						console.log(message)
						switch (message.type) {
							case 'historyChat':
								this.messageList = message.data;
								break;
							case 'message':
								this.messageList.push(message.data);
								break;
							case 'messageStatus':
								if (message.status === 'success') {
									console.log('消息发送成功');
								}
								break;
						}
						uni.setNavigationBarTitle({
							title: `正在和${this.friendName}聊天`
						});
						this.scrollToBottom()
					})
					this.websocket.onClose(() => {
						console.log("WebSocket连接已关闭")
					})
					this.websocket.onError(() => {
						console.log("WebSocket连接发生错误")
					})


				} catch (e) {
					console.log("WebSocket连接失败", e)
				}

			},
			closeWebSocket() {
				if (this.websocket) {
					this.websocket.close()
					this.websocket = null
				}
			},
			createChat() {
				const initialMessage = {
					userId: this.friendId,
					userName: this.friendName,
					userAvatar: this.friendAvatar,
					friendId: this.userId,
					friendName: this.userName,
					friendAvatar: this.userAvatar,
					senderId: this.friendId,
					content: '你好，我是商家，有什么可以帮你？',
					sendTime: Date.now(),
					type: 'text',
					readStatus: '0'
				};

				request.request({
					url: '/chat/send',
					method: 'POST',
					data: initialMessage,
					success: res => {
						if (res.data.code === 200) {
							this.messageList = [initialMessage];
							this.initWebSocket();
						} else {
							console.error('创建聊天失败:', res.data.msg);
							uni.showToast({
								title: '创建聊天失败',
								icon: 'none'
							});
						}
					},
					fail: err => {
						console.error('创建聊天请求失败:', err);
						uni.showToast({
							title: '创建聊天失败',
							icon: 'none'
						});
					}
				});
			},
			createChatList() {
				if (!this.userId || !this.friendId) {
					console.error('缺少必要的用户信息');
					return;
				}

				const chatListData = [{
						userId: this.userId,
						userName: this.userName,
						userAvatar: this.userAvatar,
						friendId: this.friendId,
						friendName: this.friendName,
						friendAvatar: this.friendAvatar,
					},
					{
						userId: this.friendId,
						userName: this.friendName,
						userAvatar: this.friendAvatar,
						friendId: this.userId,
						friendName: this.userName,
						friendAvatar: this.userAvatar,
					}
				];

				console.log('创建聊天列表的数据:', chatListData);

				request.request({
					url: '/chatList/createChatList',
					method: 'POST',
					data: chatListData,
					success: res => {
						if (res.data.code === 200) {
							console.log('创建聊天列表成功:', res.data);
						} else {
							console.error('创建聊天列表失败:', res.data.msg);
							uni.showToast({
								title: '创建聊天列表失败',
								icon: 'none'
							});
						}
					},
					fail: err => {
						console.error('创建聊天列表请求失败:', err);
						uni.showToast({
							title: '创建聊天列表失败',
							icon: 'none'
						});
					}
				});
			},
			formatTime(timestamp) {
				const date = new Date(timestamp);
				return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			},

			scrollToBottom() {
				if (!this.isAutoScroll) return;
				this.$nextTick(() => {
					setTimeout(() => {
						this.scroll = 9999999999999999999999999999999999999999999999999999999999999999999999999999999999;
					}, 100);
				});
			},

			previewImage(url) {
				uni.previewImage({
					urls: [url]
				});
			},

			sendMessage() {
				if (this.content.trim()) {
					const newMessage = {
						type: 'chat',
						data: {
							userId: this.userId,
							userName: this.userName,
							friendId: this.friendId,
							friendName: this.friendName,
							userAvatar: this.userAvatar,
							friendAvatar: this.friendAvatar,
							senderId: this.userId,
							content: this.content.trim(),
							sendTime: Date.now(),
							type: this.type,
							readStatus: '0',
						}
					};
					console.log('发送消息:', newMessage);
					this.websocket.send({
						type: 'chat',
						data: JSON.stringify(newMessage)
					})

					this.content = '';
					this.messageList.push(newMessage.data)

				}
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						request.uploadFile({
							url: `/chat/upload/${this.userId}`,

							filePath: tempFilePath,
							name: 'file',
							success: (uploadFileRes) => {
								const data = JSON.parse(uploadFileRes.data);
								if (data.code === 200) {
									console.log(data)
									const imageUrl = data.data;
									const newMessage = {
										type: 'chat',
										data: {
											userId: this.userId,
											userName: this.userName,
											friendId: this.friendId,
											friendName: this.friendName,
											userAvatar: this.userAvatar,
											friendAvatar: this.friendAvatar,
											senderId: this.userId,
											content: imageUrl,
											sendTime: Date.now(),
											type: 'image',
											readStatus: '0',
										}
									};
									this.scrollToBottom();
									this.websocket.send({
										type: 'chat',
										data: JSON.stringify(newMessage)
									});

									this.messageList.push(newMessage.data);

								} else {
									uni.showToast({
										title: '图片上传失败',
										icon: 'none'
									});
								}

							},
							fail: (err) => {
								uni.showToast({
									title: '图片上传失败',
									icon: 'none'
								});
							},
							complete: () => {
								uni.hideLoading();
							}
						});

					}
				});
			},
		}
	};
</script>
<style lang="scss" scoped>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f7fa;
	}

	.message-scroll {
		flex: 1;
		padding: 20rpx 24rpx;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.message-list {
		.message-item {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24rpx;

			&.message-right {
				margin-right: 50rpx;
				flex-direction: row;

				.message-content-wrap {
					align-items: flex-end;
					margin-right: 20rpx;
					margin-left: 80rpx;
				}

				.message-bubble {
					background-color: #0088ff;
					color: #fff;

					&::before {
						right: -8rpx;
						border-left: 8rpx solid #0088ff;
						border-right: none;
					}
				}

				.message-time {
					color: rgba(0, 0, 0, 0.45);
				}
			}

			&.message-left {
				.message-content-wrap {
					align-items: flex-start;
					margin-left: 20rpx;
					margin-right: 80rpx;
				}

				.message-bubble {
					&::before {
						left: -8rpx;
						border-right: 8rpx solid #fff;
						border-left: none;
					}
				}
			}
		}
	}

	.avatar-wrap {
		width: 120rpx;
		height: 120rpx;
		flex-shrink: 0;

		.avatar {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: #f0f2f5;
			border: 1rpx solid rgba(0, 0, 0, 0.06);
		}
	}

	.message-content-wrap {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.sender-name {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 8rpx;
	}

	.message-bubble {
		position: relative;
		max-width: 80%;
		padding: 16rpx 24rpx;
		background: #fff;
		border-radius: 16rpx;
		font-size: 34rpx;
		line-height: 1.6;
		word-break: break-all;
		display: inline-block;

		&::before {
			content: '';
			position: absolute;
			top: 20rpx;
			border-top: 8rpx solid transparent;
			border-bottom: 8rpx solid transparent;
		}

		&.image-message {
			padding: 8rpx;

			&::before {
				display: none;
			}

			.message-image {
				width: 350rpx;
				height: auto;
				border: 2rpx solid #eee;
				border-radius: 12rpx;
			}
		}
	}

	.message-time {
		font-size: 26rpx;
		color: rgba(0, 0, 0, 0.45);
		margin-top: 8rpx;
	}

	.message-text {
		display: inline-block;
		word-break: break-all;
	}

	.input-area {
		padding: 16rpx 24rpx;
		background: #fff;
		border-top: 1rpx solid #eee;
	}

	.input-container {
		display: flex;
		align-items: center;
		background: #f5f7fa;
		border-radius: 24rpx;
		padding: 12rpx 16rpx;
	}

	.message-input {
		flex: 1;
		height: 72rpx;
		background: transparent;
		padding: 0 20rpx;
		font-size: 32rpx;

		&::placeholder {
			color: #999;
		}
	}

	.action-buttons {
		display: flex;
		align-items: center;
		margin-left: 16rpx;
	}

	.image-btn {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;

		.action-icon {
			width: 40rpx;
			height: 40rpx;
			opacity: 0.6;
		}
	}

	.send-btn {
		height: 72rpx;
		padding: 0 32rpx;
		background: #e8e8e8;
		color: #999;
		border-radius: 36rpx;
		font-size: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&-active {
			background: #0088ff;
			color: #fff;
		}
	}
</style>