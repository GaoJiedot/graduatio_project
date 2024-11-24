<template>
	<view class="edit-user-container">
		<view class="edit-form">
			<view class="form-header">
				<text class="header-title">编辑用户信息</text>
			</view>
			
			<view class="form-group">
				<text class="form-label">用户账号</text>
				<input 
					class="form-input" 
					type="text" 
					v-model="userForm.userAccount" 
					disabled="true"
					placeholder="请输入用户账号"
				/>
			</view>
			
			<view class="form-group">
				<text class="form-label">用户名称</text>
				<input 
					class="form-input" 
					type="text" 
					v-model="userForm.userName" 
					placeholder="请输入用户名称"
				/>
			</view>
			
			<view class="form-group">
				<text class="form-label">用户密码</text>
				<input 
					class="form-input" 
					type="password" 
					v-model="userForm.password" 
					placeholder="请输入新密码（不修改请留空）"
				/>
			</view>
			
			<view class="form-group">
				<text class="form-label">用户类型</text>
				<picker 
					class="form-picker" 
					:value="userForm.userType" 
					:range="userTypes" 
					:range-key="'label'"
					@change="onUserTypeChange"
				>
					<view class="picker-value">
						{{ userTypes[userForm.userType] ? userTypes[userForm.userType].label : '请选择用户类型' }}
					</view>
				</picker>
			</view>
			
			<view class="form-actions">
				<button class="save-btn" @click="saveUser">保存</button>
				<button class="cancel-btn" @click="cancelEdit">取消</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userId:null,
			userForm: {
				userId:null,
				userAccount:null,
				password:'',
				userName:'',
				userType:null,
				email:'',
				userAvatar:'',
				shopId:null,
			},
			userTypes: [
				{ value: 0, label: '管理员' },
				{ value: 1, label: '商家' },
				{ value: 2, label: '用户' }
			]
		}
	},
	
	onLoad(options) {
		if (options.userId) {
			this.userId = options.userId;
			this.getUserInfo();
		}
	},
	
	methods: {
		// 获取用户信息
		getUserInfo() {
			uni.showLoading({
				title: '加载中...'
			});
			
			uni.request({
				url: `http://localhost:8080/user/userId/${this.userId}`,
				method: 'GET',
				success: (res) => {
					if (res.data.code === 200 && res.data.data) {
						this.userForm = res.data.data
						console.log(this.userForm)	
							
					} else {
						uni.showToast({
							title: '获取用户信息失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('请求失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		
		// 用户类型选择改变
		onUserTypeChange(e) {
			console.log(e)
			this.userForm.userType = e.detail.value;
			console.log(this.userForm.userType)
		},
		
		// 取消编辑
		cancelEdit() {
			this.navigateBack();
		},
		
		// 表单验证
		validateForm() {
			if (!this.userForm.userName.trim()) {
				uni.showToast({
					title: '请输入用户名称',
					icon: 'none'
				});
				return false;
			}
			return true;
		},
		
		// 保存用户信息
		saveUser() {
			if (!this.validateForm()) return;
			
			uni.showLoading({
				title: '保存中...'
			});
			
			const requestData =this.userForm;
				
			if (!requestData.password) {
				delete requestData.password;
			}
			
			uni.request({
				url: `http://localhost:8080/user/update/${this.userId}`,
				method: 'PATCH',
				data: requestData,
				success: (res) => {
					if (res.data.code === 200) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						setTimeout(() => {
							this.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res.data.msg || '保存失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('请求失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		cancelEdit() {
			uni.showModal({
				title: '提示',
				content: '确定要取消编辑吗？未保存的修改将丢失',
				success: (res) => {
					if (res.confirm) {
						this.navigateBack();
					}
				}
			});
		},
		navigateBack() {
			uni.navigateBack();
		}
	}
}
</script>

<style lang="scss" scoped>
.edit-user-container {
	padding: 30rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
	
	.edit-form {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		
		.form-header {
			margin-bottom: 40rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f0f0f0;
			
			.header-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
			}
		}
		
		.form-group {
			margin-bottom: 30rpx;
			
			.form-label {
				display: block;
				margin-bottom: 10rpx;
				font-size: 28rpx;
				color: #666;
			}
			
			.form-input {
				width: 100%;
				height: 80rpx;
				border: 2rpx solid #ddd;
				border-radius: 10rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
				background-color: #fff;
				
				&:focus {
					border-color: #4CAF50;
				}
			}
			
			.form-picker {
				width: 100%;
				height: 80rpx;
				border: 2rpx solid #ddd;
				border-radius: 10rpx;
				background-color: #fff;
				
				.picker-value {
					height: 80rpx;
					line-height: 80rpx;
					padding: 0 20rpx;
					font-size: 28rpx;
				}
			}
		}
		
		.form-actions {
			display: flex;
			justify-content: space-between;
			margin-top: 50rpx;
			
			button {
				width: 45%;
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 10rpx;
				font-size: 32rpx;
				
				&.save-btn {
					background-color: #4CAF50;
					color: #fff;
					
					&:active {
						background-color: #45a049;
					}
				}
				
				&.cancel-btn {
					background-color: #f5f5f5;
					color: #666;
					
					&:active {
						background-color: #e0e0e0;
					}
				}
			}
		}
	}
}
</style>