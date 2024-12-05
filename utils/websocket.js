// utils/websocket.js

class WebSocketService {
    constructor(options = {}) {
        this.url = options.url || 'ws://localhost:8080/websocket/';
        this.userId = options.userId;
        this.reconnectTimeout = options.reconnectTimeout || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectAttempts = 0;
        this.messageHandlers = new Map();
        this.ws = null;
        this.status = 'disconnected';
        this.pingTimer = null;
        this.pingInterval = options.pingInterval || 30000; // 30秒ping一次
    }

    // 初始化连接
    connect() {
        if (this.ws && this.status === 'connected') {
            console.log('WebSocket已连接');
            return;
        }

        try {
            this.status = 'connecting';
            this.ws = uni.connectSocket({
                url: `${this.url}${this.userId}`,
                success: () => {
                    console.log('WebSocket连接创建成功');
                }
            });

            this._initEventHandlers();
        } catch (e) {
            console.error('创建WebSocket连接失败:', e);
            this.status = 'error';
            this._handleReconnect();
        }
    }

    // 初始化WebSocket事件处理
    _initEventHandlers() {
        this.ws.onOpen(() => {
            console.log('WebSocket连接已打开');
            this.status = 'connected';
            this.reconnectAttempts = 0;
            this._startHeartbeat();
            // 触发onConnected回调
            this._triggerHandler('connected', null);
        });

        this.ws.onMessage((res) => {
            try {
                const message = JSON.parse(res.data);
                console.log('收到消息:', message);
                // 触发对应类型的消息处理器
                this._triggerHandler(message.type, message);
            } catch (e) {
                console.error('解析消息失败:', e);
            }
        });

        this.ws.onError((error) => {
            console.error('WebSocket错误:', error);
            this.status = 'error';
            this._handleReconnect();
            // 触发onError回调
            this._triggerHandler('error', error);
        });

        this.ws.onClose(() => {
            console.log('WebSocket连接已关闭');
            this.status = 'disconnected';
            this._stopHeartbeat();
            this._handleReconnect();
            // 触发onClose回调
            this._triggerHandler('close', null);
        });
    }

    // 发送消息
    send(type, data) {
            if (this.status !== 'connected') {
                console.error('WebSocket未连接');
                return false;
            }
    
            try {
                const message = {
                    type,
                    data  // 直接使用传入的data对象，不再进行JSON.stringify
                };
                
                this.ws.send({
                    data: JSON.stringify(message),
                    success: () => {
                        console.log('消息发送成功:', message);
                    },
                    fail: (error) => {
                        console.error('消息发送失败:', error);
                    }
                });
                return true;
            } catch (e) {
                console.error('发送消息失败:', e);
                return false;
            }
        }

    // 添加消息处理器
    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }

    // 移除消息处理器
    off(type, handler) {
        if (!this.messageHandlers.has(type)) return;
        if (!handler) {
            this.messageHandlers.delete(type);
            return;
        }
        const handlers = this.messageHandlers.get(type);
        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    // 触发消息处理器
    _triggerHandler(type, data) {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`处理${type}类型消息失败:`, e);
                }
            });
        }
    }

    // 处理重连
    _handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                console.log(`尝试第${this.reconnectAttempts + 1}次重连...`);
                this.reconnectAttempts++;
                this.connect();
            }, this.reconnectTimeout);
        } else {
            console.error('达到最大重连次数');
            // 触发重连失败回调
            this._triggerHandler('reconnectFailed', null);
        }
    }

    // 开始心跳检测
    _startHeartbeat() {
        this._stopHeartbeat();
        this.pingTimer = setInterval(() => {
            this.send('ping', { timestamp: Date.now() });
        }, this.pingInterval);
    }

    // 停止心跳检测
    _stopHeartbeat() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    // 关闭连接
    close() {
        this._stopHeartbeat();
        if (this.ws) {
            try {
                this.ws.close();
            } catch (e) {
                console.error('关闭WebSocket连接失败:', e);
            }
            this.ws = null;
        }
        this.status = 'disconnected';
    }

    // 获取当前连接状态
    getStatus() {
        return this.status;
    }
}

export default WebSocketService;