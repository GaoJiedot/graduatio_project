<template>
	<view class="chat-container">
		<scroll-view class="message-scroll" scroll-y :scroll-top="scrollTop" :scroll-with-animation="true"
			@scroll="handleScroll">
			<view class="message-list">
				<view class="message-item" :class="[item.senderId === userId ? 'message-right' : 'message-left']"
					v-for="(item, index) in messageList" :key="index">
					<!-- 左侧头像 -->
					<view class="avatar-wrap" v-if="item.senderId !== userId">
						<image :src="item.friendAvatar || '/static/default-avatar.png'" class="avatar"
							mode="aspectFill" />
					</view>

					<!-- 消息内容 -->
					<view class="message-bubble" :class="{'image-message': item.type === 'image'}">
						<view class="sender-name" v-if="item.senderId !== userId">
							{{item.friendName}}
						</view>

						<view class="message-content">
							<image v-if="item.type === 'image'" :src="item.content" mode="widthFix"
								@tap="previewImage(item.content)" class="message-image" />
							<text v-else class="message-text">{{ item.content }}</text>
						</view>

						<view class="message-info">
							<text class="message-time">{{ formatTime(item.sendTime) }}</text>
						</view>
					</view>

					<!-- 右侧头像 -->
					<view class="avatar-wrap " v-if="item.senderId === userId">
						<image
							:src="userAvatar || 'http://localhost:8080/avatar/1_edaf677a-d5bc-4be1-a3d3-79c2c5ea6963_avatars-23.png'"
							class="avatar" mode="aspectFill" />
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-area">
			<view class="input-container">
				<input type="text" v-model="content" class="message-input" @confirm="sendMessage"
					placeholder="请输入消息..." />

				<view class="action-buttons">
					<view class="image-btn" @tap="chooseImage">
						<image src="/static/photo.png" mode="aspectFit" class="action-icon" />
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

			// First get user info
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

			// Only call selectChat after we have friendId
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
					userId: this.userId,
					userName: this.userName,
					friendId: this.friendId,
					friendName: this.friendName,
					userAvatar: this.userAvatar,
					friendAvatar: this.friendAvatar,
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
							// 创建成功后更新消息列表并初始化 WebSocket
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
						this.scrollTop = 999999;
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

									this.websocket.send({
										type: 'chat',
										data: JSON.stringify(newMessage)
									});

									this.messageList.push(newMessage.data);
									this.scrollToBottom();
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
		background-color: #f7f7f7;
	}

	.message-scroll {
		flex: 1;
		padding: 16px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.message-list {
		.message-item {
			display: flex;
			margin-bottom: 20px;
			animation: fadeIn 0.3s ease;

			&.message-right {
				flex-direction: row-reverse;

				.message-bubble {
					margin-left: 0;
					margin-right: 12px;
					background-color: #007AFF;
					color: #fff;

					&::after {
						content: '';
						position: absolute;
						right: -6px;
						top: 12px;
						border-left: 8px solid #007AFF;
						border-top: 6px solid transparent;
						border-bottom: 6px solid transparent;
					}
				}
			}

			&.message-left .message-bubble::after {
				content: '';
				position: absolute;
				left: -6px;
				top: 12px;
				border-right: 8px solid #fff;
				border-top: 6px solid transparent;
				border-bottom: 6px solid transparent;
			}
		}
	}

	.avatar-wrap {
		width: 44px;
		height: 44px;
		flex-shrink: 0;

		.avatar {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
			border: 2px solid #fff;
		}
	}

	.message-bubble {
		max-width: 70%;
		margin-left: 12px;
		background-color: #fff;
		border-radius: 16px;
		padding: 10px 14px;
		position: relative;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;

		&.image-message {
			background-color: transparent;
			padding: 0;
			box-shadow: none;

			.message-image {
				max-width: 200px;
				border-radius: 12px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			}
		}
	}

	.sender-name {
		font-size: 13px;
		color: #8a8a8a;
		margin-bottom: 4px;
		font-weight: 500;
	}

	.message-content {
		font-size: 15px;
		line-height: 1.5;
		word-break: break-word;
	}

	.message-info {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-top: 4px;

		.message-time {
			font-size: 11px;
			color: rgba(0, 0, 0, 0.4);
		}
	}

	.input-area {
		padding: 12px 16px;
		background-color: #fff;
		border-top: 1px solid rgba(0, 0, 0, 0.05);
	}

	.input-container {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 24px;
		padding: 4px;
	}

	.message-input {
		flex: 1;
		height: 40px;
		background-color: transparent;
		padding: 0 16px;
		font-size: 15px;
		color: #333;

		&::placeholder {
			color: #999;
		}
	}

	.action-buttons {
		display: flex;
		align-items: center;
		margin-left: 8px;
	}

	.image-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin-right: 8px;
		background-color: #f0f0f0;
		transition: all 0.2s ease;

		&:active {
			background-color: #e8e8e8;
		}

		.action-icon {
			width: 24px;
			height: 24px;
			opacity: 0.7;
		}
	}

	.send-btn {
		height: 40px;
		padding: 0 20px;
		background-color: #e8e8e8;
		color: #999;
		border-radius: 20px;
		font-size: 15px;
		transition: all 0.3s ease;

		&-active {
			background-color: #007AFF;
			color: #fff;
		}

		&:active {
			transform: scale(0.98);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>