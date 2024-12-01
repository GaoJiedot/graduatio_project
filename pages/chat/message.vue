<template>
	<view class="chat-container">
		<scroll-view class="message-scroll" scroll-y :scroll-top="scrollTop">
			<!-- 消息列表 -->
			<view class="message-list">
				<view class="message-item" :class="[item.senderId === userId ? 'message-right' : 'message-left']"
					v-for="(item, index) in messageList" :key="index">

					<!-- 左侧头像 -->
					<view class="avatar-wrap" v-if="item.senderId !== userId">
						<image :src="item.senderAvatar || '/static/default-avatar.png'" class="avatar"
							mode="aspectFill" />
					</view>

					<!-- 消息内容 -->
					<view class="message-bubble" :class="{'image-message': item.type === 'image'}">
						<!-- 发送者名称 -->
						<view class="sender-name" v-if="item.senderId !== userId">
							{{item.senderName}}
						</view>

						<!-- 消息内容 -->
						<view class="message-content">
							<image v-if="item.type === 'image'" :src="item.content" mode="widthFix"
								@tap="previewImage(item.content)" class="message-image" />
							<text v-else class="message-text">{{ item.content }}</text>
						</view>

						<!-- 消息时间 -->
						<view class="message-info">
							<text class="message-time">{{ formatTime(item.sendTime) }}</text>
						</view>
					</view>

					<!-- 右侧头像 -->
					<view class="avatar-wrap" v-if="item.senderId === userId">
						<image :src="userAvatar|| '/static/default-avatar.png'" class="avatar"
							mode="aspectFill" />
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
					<button class="send-btn" @tap="sendMessage" :disabled="!content.trim()">发送</button>
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
				userId:null, 
				userName:'',
				userAvatar:'',
				friendId: '', 
				friendName:'',
				friendAvatar:'',
				shopId:null,
				messageList:[]
			};
		},

		onLoad(options) {
			this.shopId=options.shopId
			if(this.shopId){
				this.getFriendInfo()
			}
			this.getUserInfo()
			this.friendId = options.friendId;
			this.friendName=options.friendName;
			this.friendAvatar=options.friendAvatar;
		},

		methods: {
			getUserInfo(){
				uni.getStorage({
					key:'userInfo',
					success:res=>{
						console.log("我",res.data)
						this.userId=res.data.userId
						this.userName=res.data.userName
						this.userAvatar=res.data.userAvatar
					}
				})
			},
			getFriendInfo(){
				request.request({
					url:`/user/getFriendId/${this.shopId}`,
					method:'GET',
					success:res=>{
						console.log("对方",res.data.data)
						
						this.friendId=res.data.data.userId
						this.friendName=res.data.data.userName
						this.friendAvatar=res.data.data.userAvatar
					}
				})
			},
			formatTime(timestamp) {
				const date = new Date(timestamp);
				return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			},

			scrollToBottom() {
				this.$nextTick(() => {
					this.scrollTop = 999999;
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
						senderId: this.userId,
						receiverId: this.friendId,
						sendAvatar:this.userAvatar,
						receiverIAvatar:this.friendAvatar,
						content: this.content.trim(),
						sendTime: Date.now(),
					};
					this.messageList.push(newMessage);
					this.content = '';
					this.scrollToBottom();
				}
			},
			receiveMessage(message) {
				if(this.content.trim()){
					const newMessage = {
						senderId: this.friendId,
						receiverId:this.userId,
						sendAvatar:this.friendAvatar,
						receiverIAvatar:this.userAvatar,
						content: this.content.trim(),
						sendTime: Date.now(),
					};
				}
				this.messageList.push(message);
				this.scrollToBottom();
			},
			getMessageList() {
				// 获取历史消息
			},

			chooseImage() {
				// 选择图片功能
			}
		}
	};
</script>

<style lang="scss" scoped>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.message-scroll {
		flex: 1;
		padding: 10px 15px;
	}

	.message-list {
		.message-item {
			display: flex;
			margin-bottom: 15px;

			&.message-right {
				flex-direction: row-reverse;

				.message-bubble {
					margin-left: 0;
					margin-right: 10px;
					background-color: #007AFF;
					color: #fff;
				}
			}
		}
	}

	.avatar-wrap {
		width: 40px;
		height: 40px;
		flex-shrink: 0;

		.avatar {
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}
	}

	.message-bubble {
		max-width: 70%;
		margin-left: 10px;
		background-color: #fff;
		border-radius: 12px;
		padding: 8px 12px;
		position: relative;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

		&.image-message {
			background-color: transparent;
			padding: 0;
			box-shadow: none;

			.message-image {
				max-width: 200px;
				border-radius: 8px;
			}
		}
	}

	.sender-name {
		font-size: 12px;
		color: #999;
		margin-bottom: 4px;
	}

	.message-content {
		font-size: 15px;
		line-height: 1.4;
	}

	.message-info {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-top: 4px;

		.message-time {
			font-size: 11px;
			color: #999;
		}
	}

	.input-area {
		padding: 10px 15px;
		background-color: #fff;
		border-top: 1px solid #eee;
	}

	.input-container {
		display: flex;
		align-items: center;
	}

	.message-input {
		flex: 1;
		height: 36px;
		background-color: #f5f5f5;
		border-radius: 18px;
		padding: 0 15px;
		font-size: 15px;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		margin-left: 10px;
	}

	.image-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 8px;

		.action-icon {
			width: 24px;
			height: 24px;
		}
	}

	.send-btn {
		height: 36px;
		line-height: 36px;
		padding: 0 15px;
		background-color: #007AFF;
		color: #fff;
		border-radius: 18px;
		font-size: 15px;
	}
</style>