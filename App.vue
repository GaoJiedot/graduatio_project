<script>
	import initWebSocket from './utils/websocket.js';
	import getWebSocket from './utils/websocket.js';
	export default {
		onLaunch() {
			try {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					const ws = initWebSocket(userInfo.userId);

					// 注册消息处理器
					ws.on('connected', () => {
						console.log('WebSocket连接成功');
					});

					ws.on('chatListUpdate', (data) => {
						console.log('聊天列表更新:', data);
						// 处理聊天列表更新
					});

					ws.on('newMessage', (data) => {
						console.log('收到新消息:', data);
						// 处理新消息
					});

					// 连接WebSocket
					ws.connect();
				}
			} catch (e) {
				console.error('初始化WebSocket失败:', e);
			}
		},

		onHide() {
			const ws = getWebSocket();
			if (ws) {
				ws.close();
			}
		},
		onShow: function() {
			// this.checkLoginStatus();
		},
		methods: {
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				if (!token) {
					this.redirectToLogin();
				}
			},
			redirectToLogin() {
				uni.reLaunch({
					url: '/pages/login/login',
					success: () => {
						console.log('成功跳转到登录页');
						// 安全地调用关闭启动屏
						this.closeSplashScreen();
					},
					fail: (err) => {
						console.error('跳转失败:', err);
						uni.showToast({
							title: '跳转失败，请重试',
							icon: 'none'
						});
					}
				});
			},
			closeSplashScreen() {
				// 检查是否在App环境
				// #ifdef APP-PLUS
				try {
					if (typeof plus !== 'undefined' && plus.navigator) {
						plus.navigator.closeSplashscreen();
						console.log('启动屏关闭成功');
					}
				} catch (e) {
					console.log('关闭启动屏失败', e);
				}
				// #endif
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>