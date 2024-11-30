<template>
	<view class="page">
		<scroll-view class="scroll-view" scroll-y scroll-with-animation :scroll-top="top"
			@scrolltoupper="loadMoreHistory">
			<view class="message-container">
				<view class="loading" v-if="isLoading">加载中...</view>
				<view class="message" :class="[item.userType]" v-for="(item, index) in list" :key="index">
					<view class="avatar-container" v-if="item.userType === 'friend'">
						<image :src="item.avatar" class="avatar" mode="aspectFill" />
					</view>
					<view class="message-content">
						<view class="content" :class="{'image-content': item.messageType === 'image'}">
							<image v-if="item.messageType === 'image'" :src="item.content" mode="widthFix"
								@tap="previewImage(item.content)" />
							<text v-else>{{ item.content }}</text>
						</view>
						<text class="time">{{ formatTime(item.time) }}</text>
					</view>
					<view class="avatar-container" v-if="item.userType === 'self'">
						<image :src="item.avatar" class="avatar" mode="aspectFill" />
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="tool">
			<view class="tool-inner">
				<input type="text" v-model="content" class="input" @confirm="send" placeholder="请输入消息..."
					:disabled="sending" />
				<view class="action-group">
					<image src="/static/photo.png" mode="aspectFit" class="action-icon" @tap="chooseImage" />
					<button class="send-btn" :class="{'disabled': !content.trim()}" @tap="send" :disabled="sending">
						发送
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js';
	export default {
		data() {
			return {
				content: '',
				list: [],
				top: 0,
				page: 1,
				isLoading: false,
				sending: false,
				websocket: null,
				chatInitialized: false,
				userId: null,
				userName: '',
				userAvatar: '',
				counterpartyId: null,
				counterpartyName: '',
				counterpartyAvatar: '',
				shopId: null
			}
		},

		onLoad(options) {
			uni.setNavigationBarTitle({
				title: options.userName || this.counterpartyName || '聊天'
			});
			if (options.shopId) {
				this.shopId = options.shopId;
			}
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.userName = res.data.userName;
					this.userId = res.data.userId;
					this.userAvatar = res.data.userAvatar;
				}
			})
			this.getcounterpartyId();
			this.checkAndInitializeChat();
		},

		onUnload() {
			this.closeWebSocket()
		},

		methods: {
			async getcounterpartyId() {
				const response = await request.request({
					url: `/user/getcounterpartyId/${this.shopId}`,
					method: 'GET',
					success: (res) => {
						this.counterpartyId = res.data.userId;
						this.counterpartyName = res.data.userName;
						this.counterpartyAvatar = res.data.userAvatar;
					}
				});
			},

			// 初始化 WebSocket
			initWebSocket() {
				const WS_URL = 'ws://localhost:8080/websocket/' + this.userId;
				this.websocket = uni.connectSocket({
					url: WS_URL
				});

				this.websocket.onOpen(() => {
					console.log('WebSocket已连接');
				});

				this.websocket.onMessage((res) => {
					const message = JSON.parse(res.data);
					this.handleNewMessage(message);
				});

				this.websocket.onError((error) => {
					console.error('WebSocket错误：', error);
				});

				this.websocket.onClose(() => {
					console.log('WebSocket连接已关闭');
				});
			},

			// 关闭 WebSocket
			closeWebSocket() {
				if (this.websocket) {
					this.websocket.close();
				}
			},

			async checkAndInitializeChat() {
				try {
					const response = await request.request({
						url: `/chat/check`,
						method: 'GET',
						data: {
							userId: this.userId,
							friendId: this.counterpartyId
						}
					});

					if (response.statusCode === 200) {
						this.chatInitialized = true;
						this.initWebSocket();
						this.loadHistoryMessages();
					} else {
						await this.createNewChat();
					}
				} catch (error) {
					console.error('检查聊天状态失败：', error);
					this.handleError('初始化聊天失败');
				}
			},

			// 创建新聊天
			async createNewChat() {
				try {
					const response = await request.request({
						url: '/chat/create',
						method: 'POST',
						data: {
							userId: this.userId,
							friendId: this.counterpartyId
						}
					});

					if (response.statusCode === 200) {
						this.chatInitialized = true;
						this.initWebSocket();
						this.showWelcomeMessage();
					} else {
						throw new Error('创建聊天失败');
					}
				} catch (error) {
					console.error('创建新聊天失败：', error);
					this.handleError('创建新聊天失败');
				}
			},

			showWelcomeMessage() {
				this.list.push({
					content: '开始聊天吧！',
					userType: 'system',
					time: new Date().getTime(),
					messageType: 'text'
				});
			},

			handleNewMessage(message) {
				if (message.type === 'message') {
					this.list.push({
						content: message.data.content,
						userType: 'friend',
						avatar: this.counterpartyAvatar,
						time: new Date().getTime(),
						messageType: message.data.type || 'text'
					});

					this.scrollToBottom();
				} else if (message.type === 'chatListUpdate') {
					// 更新聊天列表（此处根据需要进行处理）
					console.log('更新聊天列表：', message.data);
				}
			},

			async loadHistoryMessages() {
				this.isLoading = true;
				try {
					const response = await request.request({
						url: `/chat/history`,
						data: {
							userId: this.userId,
							page: this.page,
							size: 20
						}
					});

					if (response.statusCode === 200) {
						const messages = response.data.reverse();
						this.list.unshift(...messages);
					}
				} catch (error) {
					console.error('加载历史消息失败：', error);
				} finally {
					this.isLoading = false;
				}
			},

			formatTime(timestamp) {
				const date = new Date(timestamp);
				const now = new Date();
				const diff = now - date;

				if (diff < 24 * 60 * 60 * 1000) {
					return date.getHours().toString().padStart(2, '0') + ':' +
						date.getMinutes().toString().padStart(2, '0');
				} else if (diff < 7 * 24 * 60 * 60 * 1000) {
					const days = ['日', '一', '二', '三', '四', '五', '六'];
					return '星期' + days[date.getDay()];
				} else {
					return (date.getMonth() + 1) + '月' + date.getDate() + '日';
				}
			},

			async send() {
				if (!this.content.trim() || this.sending) return;
				if (!this.chatInitialized) {
					this.handleError('聊天未初始化');
					return;
				}

				this.sending = true;
				const message = {
					content: this.content,
					senderId: this.userId,
					receiverId: this.counterpartyId,
					type: 'text',
					time: new Date().getTime()
				};

				try {
					this.list.push({
						content: this.content,
						userType: 'self',
						avatar: this.userAvatar,
						time: message.time,
						messageType: 'text'
					});

					await this.sendWebSocketMessage(message);
					this.content = '';
					this.scrollToBottom();
				} catch (error) {
					console.error('发送消息失败：', error);
					this.handleError('发送失败');
					this.list.pop();
				} finally {
					this.sending = false;
				}
			},

			sendWebSocketMessage(message) {
				return new Promise((resolve, reject) => {
					if (!this.websocket || this.websocket.readyState !== 1) {
						reject(new Error('WebSocket未连接'));
						return;
					}

					try {
						this.websocket.send({
							data: JSON.stringify(message),
							success: () => resolve(),
							fail: (error) => reject(error)
						});
					} catch (error) {
						reject(error);
					}
				});
			},

			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success: (res) => {
						const message = {
							content: res.tempFilePaths[0],
							senderId: this.userId,
							receiverId: this.counterpartyId,
							type: 'image',
							time: new Date().getTime(),
							senderAvatar: this.userAvatar,
							receiverAvatar: this.counterpartyAvatar
						};

						this.websocket.send({
							data: JSON.stringify(message)
						});

						this.list.push({
							content: res.tempFilePaths[0],
							userType: 'self',
							messageType: 'image',
							avatar: this.userAvatar,
							time: message.time
						});

						this.scrollToBottom();
					},
					fail: () => {
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},

			handleError(message) {
				uni.showToast({
					title: message,
					icon: 'none'
				});
			},

			scrollToBottom() {
				this.top = this.list.length * 100; // 滚动到底部
			},

			loadMoreHistory() {
				if (this.isLoading) return;
				this.page++;
				this.loadHistoryMessages();
			},

			previewImage(content) {
				uni.previewImage({
					urls: [content],
				});
			}
		}
	}
</script>

<style scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.scroll-view {
		flex: 1;
		padding: 10px;
	}

	.message-container {
		display: flex;
		flex-direction: column;
	}

	.message {
		display: flex;
		flex-direction: row;
		margin-bottom: 10px;
	}

	.avatar-container {
		width: 40px;
		height: 40px;
		margin-right: 10px;
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.message-content {
		max-width: 80%;
		padding: 5px 10px;
		border-radius: 10px;
	}

	.content {
		word-wrap: break-word;
	}

	.image-content {
		max-width: 200px;
	}

	.time {
		font-size: 12px;
		color: #888;
		margin-top: 5px;
		text-align: right;
	}

	.tool {
		padding: 10px;
		border-top: 1px solid #ddd;
	}

	.tool-inner {
		display: flex;
		align-items: center;
	}

	.input {
		flex: 1;
		padding: 8px;
		border-radius: 20px;
		border: 1px solid #ddd;
	}

	.action-group {
		display: flex;
		align-items: center;
		margin-left: 10px;
	}

	.action-icon {
		width: 24px;
		height: 24px;
		margin-right: 10px;
	}

	.send-btn {
		background-color: #007aff;
		color: white;
		padding: 8px 15px;
		border-radius: 20px;
		cursor: pointer;
	}

	.send-btn.disabled {
		background-color: #ccc;
	}
</style>