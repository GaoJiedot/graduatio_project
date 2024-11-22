<template>
	<view class="container">
		<image :src="previewImage || data.userAvatar "class="avatar" @click="chooseImage"  />
		<view class="userbox">
			<view class="userbox">
				<view class="title">用户名:{{data.userName}}</view>
				<input class="uni-input" v-model="newUserName" focus placeholder="请输入新的用户名" />
			</view>
		</view>
		<button class="submit-btn" @click="submitbtn">保存</button>
	</view>
	
</template>

<script>
	export default {
		data() {
			return {
				newUserName: '',
				previewImage: '', 
				tempFilePath: '', 
				data: {
					email: "",
					password: "",
					userAccount: null,
					userId: null,
					userType: null,
					userName: "",
					userAvatar: ""
				}
			};
		},
		methods: {
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.tempFilePath = res.tempFilePaths[0];
						this.previewImage = res.tempFilePaths[0];
					}
				});
			},

			async uploadFile() {
				return new Promise((resolve, reject) => {
					if (!this.tempFilePath) {
						resolve(null); 
						return;
					}

					uni.uploadFile({
						url: `http://localhost:8080/user/uploadAvatar/${this.data.userId}`,
						filePath: this.tempFilePath,
						name: 'file',
						success: (uploadRes) => {
							console.log(uploadRes.data);
							try {
								const result = JSON.parse(uploadRes.data);
								if (result.code === 200) {
									resolve(result.data);
								} else {
									reject(new Error(result.message || '上传失败'));
								}
							} catch (e) {
								reject(new Error('处理响应失败'));
							}
						},
						fail: (err) => {
							reject(new Error('上传失败'));
						}
					});
				});
			},

			async updateUserInfo(updateData) {
				return new Promise((resolve, reject) => {
					uni.request({
						url: 'http://localhost:8080/user',
						method: 'PUT',
						header: {
							'Content-Type': 'application/json'
						},
						data: updateData,
						success: (res) => {
							if (res.data.code === 200) {
								resolve(res.data);
							} else {
								reject(new Error(res.data.message || '更新失败'));
							}
						},
						fail: (err) => {
							reject(new Error('网络请求失败'));
						}
					});
				});
			},

			async submitbtn() {
				if (!this.newUserName.trim()) {
					uni.showToast({
						title: '用户名不能为空',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '保存中...'
				});

				try {
					let updateData = {
						...this.data,
						userName: this.newUserName
					};

					if (this.tempFilePath) {
						const avatarPath = await this.uploadFile();
						if (avatarPath) {
							updateData = {
								...updateData,
								userAvatar: avatarPath
							};
						}
					}

					const result = await this.updateUserInfo(updateData);
					this.data = updateData;
					uni.setStorageSync('userInfo', updateData);

					uni.showToast({
						title: '修改成功',
						icon: 'success'
					});

					this.tempFilePath = '';
					this.previewImage = '';
					setTimeout(() => {
					    uni.reLaunch({
					        url: "/pages/user/user"
					    });
					}, 1500);

				} catch (error) {
					console.error('保存失败:', error);
					uni.showToast({
						title: error.message || '保存失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			}
		},

		onLoad() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					this.data = userInfo;
					this.newUserName = userInfo.userName;
				}
			
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;

		.avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			margin: 100rpx 0;
			border: 2rpx solid #eee;
		}

		.userbox {
			width: 100%;
			padding: 30rpx;

			.title {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 20rpx;
			}

			input {
				background-color: #fff;
				padding: 20rpx;
				border-radius: 8rpx;
				margin-top: 20rpx;
			}
		}

		button {
			width: 60%;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			background-color: #28aff6;
			color: #fff;
			font-size: 28rpx;
			margin-top: 60rpx;

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>