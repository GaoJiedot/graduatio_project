<template>
    <view class="edit-shop-container">
        <view class="nav-header">
            <text class="page-title">您的店铺信息:</text>
            <view class="save-icon" @click="saveShopInfo">
                <text>保存</text>
            </view>
        </view>

        <view class="edit-form">
            <view class="form-item">
                <text class="label">店铺Logo:</text>
                <view class="upload-logo" @click="uploadLogo">
                    <image :src="shopInfo.shopLogo || '/static/default-logo.png'" mode="aspectFill"></image>
                    <text class="upload-tips">点击上传</text>
                </view>
            </view>

            <view class="form-item">
                <text class="label">店铺名称:</text>
                <input 
                    class="input-field" 
                    v-model="shopInfo.shopName" 
                    placeholder="请输入店铺名称"
                />
            </view>

            <view class="form-item">
                <text class="label">店铺描述:</text>
                <textarea 
                    class="textarea-field" 
                    v-model="shopInfo.shopDescription" 
                    placeholder="简单介绍您的店铺"
                    maxlength="200"
                ></textarea>
            </view>

            <view class="form-item">
                <text class="label">联系电话:</text>
                <input 
                    class="input-field" 
                    v-model="shopInfo.shopPhone" 
                    type="number"
                    placeholder="请输入联系电话"
                />
            </view>

            <view class="form-item">
                <text class="label">营业时间:</text>
                <input 
                    class="input-field" 
                    v-model="shopInfo.shopBusinessHours" 
                    placeholder="例如：09:00-22:00"
                />
            </view>

            <view class="form-item">
                <text class="label">店铺地址:</text>
                <input 
                    class="input-field" 
                    v-model="shopInfo.shopAddress" 
                    placeholder="请输入详细地址"
                />
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            userInfo: {},
            shopInfo: {
                shopLogo: '',
                shopName: '',
                shopDescription: '',
                shopPhone: '',
                shopBusinessHours: '',
                shopAddress: ''
            }
        }
    },
    methods: {
        // 返回上一页
        goBack() {
            uni.navigateBack();
        },

        // 上传Logo
        uploadLogo() {
            uni.chooseImage({
                count: 1,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const tempFilePath = res.tempFilePaths[0];
                    // 这里实现文件上传逻辑
                    uni.uploadFile({
                        url: 'http://localhost:8080/user/uploadAvatar/${this.data.userId}',
                        filePath: tempFilePath,
                        name: 'file',
                        success: (uploadRes) => {
                            const logoUrl = JSON.parse(uploadRes.data).data.fileUrl;
                            this.shopInfo.shopLogo = logoUrl;
                        }
                    });
                }
            });
        },

        // 保存店铺信息
        saveShopInfo() {
            // 校验表单
            if (!this.validateForm()) return;

            uni.request({
                url: 'http://localhost:8080/shop',
                method: 'PUT',
                data: {
                    ...this.shopInfo,
                    shopId: this.userInfo.shopId
                },
                success: (res) => {
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                    // 可选：更新本地存储
                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1500);
                },
                fail: (err) => {
                    uni.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                }
            });
        },

        // 表单校验
        validateForm() {
            const { shopName, shopPhone, shopAddress } = this.shopInfo;
            
            if (!shopName) {
                uni.showToast({ title: '请输入店铺名称', icon: 'none' });
                return false;
            }
            
            if (!shopPhone || !/^1[3-9]\d{9}$/.test(shopPhone)) {
                uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
                return false;
            }
            
            if (!shopAddress) {
                uni.showToast({ title: '请输入店铺地址', icon: 'none' });
                return false;
            }
            
            return true;
        }
    },
    onLoad() {
        // 获取用户信息
        uni.getStorage({
            key: 'userInfo',
            success: (res) => {
                this.userInfo = res.data;
                
                // 获取当前店铺信息
                uni.request({
                    url: `http://localhost:8080/shop/${this.userInfo.shopId}`,
                    method: 'GET',
                    success: (res) => {
                        this.shopInfo = res.data.data;
                    }
                });
            }
        });
    }
}
</script>

<style lang="scss" scoped>
.edit-shop-container {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 30rpx;

    .nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40rpx;

        .back-icon image {
            width: 50rpx;
            height: 50rpx;
        }

        .page-title {
            font-size: 36rpx;
            font-weight: bold;
        }

        .save-icon {
            color: #4CAF50;
            font-size: 32rpx;
        }
    }

    .edit-form {
        background-color: white;
        border-radius: 20rpx;
        padding: 30rpx;

        .form-item {
            margin-bottom: 30rpx;

            .label {
                display: block;
                margin-bottom: 15rpx;
                font-size: 32rpx;
                color: #333;
            }

            .upload-logo {
                position: relative;
                width: 200rpx;
                height: 200rpx;
                border-radius: 20rpx;
                overflow: hidden;

                image {
                    width: 100%;
                    height: 100%;
                }

                .upload-tips {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    text-align: center;
                    background: rgba(0,0,0,0.5);
                    color: white;
                    padding: 10rpx 0;
                }
            }

            .input-field, .textarea-field {
                width: 100%;
                border: 1rpx solid #e0e0e0;
                border-radius: 10rpx;
                padding: 20rpx;
                font-size: 32rpx;
            }

            .textarea-field {
                height: 200rpx;
            }
        }
    }
}
</style>