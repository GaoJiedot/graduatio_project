<script>
import WebSocketService from './utils/websocket.js';

export default {
	data() {
		return {
			wsService: null,
			isLoggedIn: false
		};
	},

	onLaunch() {
		this.initializeApp();
	},

	onShow() {
		if (this.isLoggedIn && !this.wsService) {
			this.initializeWebSocket();
		}
	},

	onHide() {
		this.closeWebSocket();
	},

	methods: {
		initializeApp() {
			try {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					this.isLoggedIn = true;
					this.initializeWebSocket();
				} else {
					this.redirectToLogin();
				}
			} catch (error) {
				console.error('App初始化失败:', error);
				this.handleError('应用初始化失败');
			}
		},

		initializeWebSocket() {
			try {
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) throw new Error('用户未登录');

				this.wsService = new WebSocketService({
					userId: userInfo.userId,
					url: 'ws://localhost:8080/websocket/'
				});

				this.registerWebSocketHandlers();
				this.wsService.connect();
			} catch (error) {
				console.error('WebSocket初始化失败:', error);
				this.handleError('连接服务器失败');
			}
		},

		registerWebSocketHandlers() {
			this.wsService.on('connected', () => {
				console.log('WebSocket连接成功');
			});

			this.wsService.on('chatListUpdate', (data) => {
				console.log('聊天列表更新:', data);
				uni.$emit('chatListUpdate', data);
			});

			this.wsService.on('newMessage', (data) => {
				console.log('收到新消息:', data);
				uni.$emit('newMessage', data);
			});

			this.wsService.on('error', () => {
				this.handleError('连接异常，请检查网络');
			});
		},

		closeWebSocket() {
			if (this.wsService) {
				this.wsService.close();
				this.wsService = null;
			}
		},

		redirectToLogin() {
			uni.reLaunch({
				url: '/pages/login/login',
				success: () => {
					console.log('成功跳转到登录页');
					this.closeSplashScreen();
				},
				fail: (error) => {
					console.error('跳转失败:', error);
					this.handleError('跳转失败，请重试');
				}
			});
		},

		handleError(message) {
			uni.showToast({
				title: message,
				icon: 'none'
			});
		},

		closeSplashScreen() {
			// #ifdef APP-PLUS
			try {
				if (typeof plus !== 'undefined' && plus.navigator) {
					plus.navigator.closeSplashscreen();
					console.log('启动屏关闭成功');
				}
			} catch (error) {
				console.error('关闭启动屏失败:', error);
			}
			// #endif
		}
	}
};
</script>

<style>
/*每个页面公共css */
</style>