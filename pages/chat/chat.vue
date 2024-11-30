<template>
	<view class="page">
		<view class="list-item" v-for="(item, index) in chatList" :key="index" @click="connect(item)">
			<view class="avatar">
				<text class="round" v-if="item.unreadStatus === 0"></text>
				<image :src="item.friendAvatar" mode="widthFix"></image>
			</view>
			<view class="content">
				<view class="title">
					<text class="name">{{ item.friendName }}</text>
					<text class="time">{{ item.sendTime }}</text>
				</view>
				<view class="txt">{{ item.content }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js';

	const WS_URL = 'ws://localhost:8080';

	export default {
		data() {
			return {
				userId: '',
				websocket: null,
				chatList: [],
			};
		},

		onLoad() {
			// Load user info from storage
			uni.getStorage({
				key: 'userInfo',
				success: (res) => {
					this.userId = res.data.userId;
				}
			});

			this.initWebSocket();
			this.loadChatList();
		},

		onUnload() {
			this.closeWebSocket();
		},

		methods: {
			initWebSocket() {
			            this.websocket = uni.connectSocket({
			                url: `${WS_URL}/websocket/${this.userId}`,
			                complete: () => {}
			            });
			
			            this.websocket.onOpen(() => {
			                console.log('WebSocket连接已打开');
			            });
			
			            this.websocket.onMessage((res) => {
			                console.log('收到WebSocket消息:', res.data);
			                const message = JSON.parse(res.data);
			                
			                // 根据消息类型处理
			                switch(message.type) {
			                    case 'init':
			                        if (message.status === 'success') {
			                            this.chatList = message.chatList;
			                        }
			                        break;
			                    case 'chatListUpdate':
			                        this.chatList = message.data;
			                        break;
			                    case 'message':
			                        // 收到新消息时刷新列表
			                        this.loadChatList();
			                        break;
			                }
			            });
			
			            this.websocket.onError((error) => {
			                console.error('WebSocket错误：', error);
			                uni.showToast({
			                    title: 'WebSocket连接错误',
			                    icon: 'none'
			                });
			            });
			        },

			closeWebSocket() {
				if (this.websocket) {
					this.websocket.close();
				}
			},

			async loadChatList() {
			            try {
			                const response = await request.request({
			                    url: `/chatList/getChatList/${this.userId}`,
			                    method: 'GET'
			                });
			                
			                console.log('接口返回数据:', response);
			                
			                if (response.statusCode === 200 && response.data.code === 200) {
			                    this.chatList = response.data.data || [];
			                    console.log('处理后的聊天列表:', this.chatList);
			                }
			            } catch (error) {
			                console.error('加载聊天列表失败：', error);
			                uni.showToast({
			                    title: '加载聊天列表失败',
			                    icon: 'none'
			                });
			            }
			        },

			connect(item) {
				uni.navigateTo({
					url: `/pages/chat/message?userId=${item.userId}&userName=${item.userName}&uservatar=${item.uservatar}`
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page {
		padding: 0 32rpx;
		color: #333;
	}

	.list-item {
		display: flex;
		padding: 30rpx 0;
		border-bottom: 0.3px solid #ccced3;

		.avatar {
			width: 90rpx;
			height: 90rpx;
			border-radius: 10rpx;
			margin-right: 20rpx;
			position: relative;

			.round {
				position: absolute;
				width: 14rpx;
				height: 14rpx;
				border-radius: 50%;
				background: #ef5656;
				top: -4rpx;
				right: -4rpx;
				z-index: 1;
			}

			image {
				width: 100%;
				height: 100%;
				border-radius: 10rpx;
			}
		}

		.content {
			flex: 1;

			.title {
				display: flex;
				justify-content: space-between;

				.name {
					font-weight: bold;
				}

				.time {
					color: #999;
					font-size: 24rpx;
				}
			}

			.txt {
				margin-top: 10rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 1;
				-webkit-box-orient: vertical;
				text-align: left;
				color: #999;
				font-size: 26rpx;
			}
		}
	}
</style>