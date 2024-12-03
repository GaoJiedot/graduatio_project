<template>
	<view class="chat-page">
		<view v-if="connectionStatus !== 'connected'" class="status-bar" :class="connectionStatus">
			{{ getStatusMessage }}
		</view>

		<view class="chat-list">
			<view class="chat-item" v-for="(chat, index) in chatList" :key="index" @tap="navigateToChat(chat)">
				<view class="avatar-container">
					<image class="avatar" :src="chat.friendAvatar" mode="aspectFill"></image>
					<view v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</view>
				</view>

				<view class="chat-info">
					<view class="chat-header">
						<text class="name">{{ chat.friendName }}</text>
						<text class="time">{{ formatTime(chat.sendTime) }}</text>
					</view>
					<text class="last-message">{{ chat.content || '' }}</text>
				</view>
			</view>
		</view>
		<view v-if="chatList.length === 0" class="empty-state">
			<text>暂无聊天记录</text>
		</view>
	</view>
</template>

<script>
	const RECONNECT_TIMEOUT = 3000;
	const WS_URL = `ws://localhost:8080/websocket/`;
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				chatList: [],
				websocket: null,
				connectionStatus: 'disconnected',
				userId: '',
				reconnectAttempts: 0,
				maxReconnectAttempts: 5
			};
		},

		computed: {
			getStatusMessage() {
				const messages = {
					connecting: '正在连接...',
					disconnected: '连接已断开，正在重新连接...',
					error: '连接错误，请检查网络'
				};
				return messages[this.connectionStatus] || '';
			}
		},

		onLoad() {
			try {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					console.log('用户信息:', userInfo);
					this.userId = userInfo.userId;
					this.initWebSocket();
				} else {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
				}
			} catch (e) {
				console.error('获取用户信息失败:', e);
			}
			
		},

		onUnload() {
			this.closeWebSocket();
		},

		methods: {
			initWebSocket() {
				if (this.websocket) {
					this.closeWebSocket();
				}

				this.connectionStatus = 'connecting';

				try {
					this.websocket = uni.connectSocket({
						url: `${WS_URL}${this.userId}`,
						success: () => {
							console.log('WebSocket连接创建成功');
						}
					});

					this.websocket.onOpen(() => {
						console.log('WebSocket连接已打开');
						this.connectionStatus = 'connected';
						this.reconnectAttempts = 0;
						
					});

					this.websocket.onMessage((res) => {
						try {
							const message = JSON.parse(res.data);
							console.log('收到消息:', message);

							this.handleWebSocketMessage(message);
						} catch (e) {
							console.error('解析消息失败:', e);
						}
					});

					this.websocket.onError((error) => {
						console.error('WebSocket错误:', error);
						this.connectionStatus = 'error';
						this.handleReconnect();
					});

					this.websocket.onClose(() => {
						console.log('WebSocket连接已关闭');
						this.connectionStatus = 'disconnected';
						this.handleReconnect();
					});

				} catch (e) {
					console.error('创建WebSocket连接失败:', e);
					this.connectionStatus = 'error';
				}
			},

			handleWebSocketMessage(message) {
				switch (message.type) {
					case 'init':
						if (message.chatList) {
							this.chatList = this.formatChatList(message.chatList);
						}
						break;

					case 'chatListUpdate':
						if (message.data) {
							this.chatList = this.formatChatList(message.data);
						}
						break;

					case 'status':
						this.updateUserStatus(message);
						break;

					default:
						console.log('未知消息类型:', message.type);
				}
			},
			
			closeWebSocket() {
				if (this.websocket) {
					this.websocket.close();
					this.websocket = null;
				}
			},

			formatChatList(list) {
				console.log('格式化前的聊天列表:', list);
				return list.map(item => ({
					...item,
					friendAvatar: item.friendAvatar || 'http://localhost:8080/avatar/1_edaf677a-d5bc-4be1-a3d3-79c2c5ea6963_avatars-23.png',
					friendName: item.friendName || item.friendname || '未知用户',
					content: item.content || '',
					sendTime: item.sendTime || new Date().toISOString(),
					unreadCount: item.unreadStatus === 0 ? 1 : 0
				}));
			},

			updateUserStatus(statusMessage) {
				const chatIndex = this.chatList.findIndex(
					chat => chat.friendId === statusMessage.userId
				);

				if (chatIndex !== -1) {
					this.chatList[chatIndex].online = statusMessage.status === 'online';
					this.chatList = [...this.chatList];
				}
			},

			handleReconnect() {
				if (this.reconnectAttempts < this.maxReconnectAttempts) {
					setTimeout(() => {
						console.log('尝试重新连接...');
						this.reconnectAttempts++;
						this.initWebSocket();
					}, RECONNECT_TIMEOUT);
				} else {
					uni.showToast({
						title: '连接失败，请检查网络后重试',
						icon: 'none'
					});
				}
			},

			formatTime(timestamp) {
				if (!timestamp) return '';

				const date = new Date(timestamp);
				const now = new Date();
				const diff = now - date;

				if (diff < 24 * 60 * 60 * 1000) {
					return date.toTimeString().slice(0, 5);
				}

				if (diff < 7 * 24 * 60 * 60 * 1000) {
					const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
					return days[date.getDay()];
				}


				return `${date.getMonth() + 1}-${date.getDate()}`;
			},
			navigateToChat(chat) {
			    try {
			        const url = `/pages/chat/message?friendId=${encodeURIComponent(chat.friendId)}&friendName=${encodeURIComponent(chat.friendName)}&friendAvatar=${encodeURIComponent(chat.friendAvatar)}`;
			        uni.navigateTo({
			            url,
			            fail: (error) => {
			                console.error('导航失败:', error);
			                uni.showToast({
			                    title: '页面跳转失败',
			                    icon: 'none'
			                });
			            }
			        });
			    } catch (error) {
			        console.error('导航错误:', error);
			        uni.showToast({
			            title: '页面跳转出错',
			            icon: 'none'
			        });
			    }
			},

			closeWebSocket() {
				if (this.websocket) {
					try {
						this.websocket.close();
					} catch (e) {
						console.error('关闭WebSocket连接失败:', e);
					}
				}
			}
		}
	};
</script>

<style lang="scss">
	.chat-page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.status-bar {
		padding: 10rpx 20rpx;
		text-align: center;
		font-size: 24rpx;

		&.connecting {
			background-color: #e6f7ff;
			color: #1890ff;
		}

		&.disconnected {
			background-color: #fff1f0;
			color: #f5222d;
		}

		&.error {
			background-color: #fff2e8;
			color: #fa541c;
		}
	}

	.chat-list {
		padding: 0 20rpx;
	}

	.chat-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;

		&:active {
			background-color: #f0f0f0;
		}
	}

	.avatar-container {
		position: relative;
		margin-right: 20rpx;
	}

	.avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 10rpx;
	}

	.unread-badge {
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		min-width: 32rpx;
		height: 32rpx;
		padding: 0 6rpx;
		border-radius: 16rpx;
		background-color: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chat-info {
		flex: 1;
		overflow: hidden;
	}

	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.name {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.last-message {
		font-size: 28rpx;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty-state {
		padding: 60rpx 0;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}
</style>