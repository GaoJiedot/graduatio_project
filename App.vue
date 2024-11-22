<script>
export default {
    onLaunch: function() {
        // 检查是否需要跳转到登录页
        this.checkLoginStatus();
    },
    methods: {
        // 检查登录状态
        checkLoginStatus() {
            const token = uni.getStorageSync('token');
            
            if (!token) {
                // 无 token，跳转到登录页
                this.redirectToLogin();
            } else {
                // 关闭启动屏
                this.closeSplashScreenIfNeeded();
            }
        },

        // 跳转到登录页
        redirectToLogin() {
            // 使用 reLaunch 完全重新加载
            uni.reLaunch({
                url: '/pages/login/login',
                success: () => {
                    console.log('成功跳转到登录页');
                    this.closeSplashScreenIfNeeded();
                },
                fail: (err) => {
                    console.error('跳转失败', err);
                }
            });
        },

        // 关闭启动屏
        closeSplashScreenIfNeeded() {
            // 仅在移动端关闭启动屏
            const systemInfo = uni.getSystemInfoSync();
            if ((systemInfo.platform === 'android' || systemInfo.platform === 'ios') 
                && typeof plus !== 'undefined' 
                && plus.navigator) {
                plus.navigator.closeSplashscreen();
            }
        }
    }
}
</script>

<style>
	/*每个页面公共css */
</style>
