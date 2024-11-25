<template>
	<view class="shop-details">

		<!-- 商店详情页头部 -->
		<view class="header">
			<!-- 轮播图 -->
			<swiper class="banner" autoplay="true" interval="3000" circular>
				<swiper-item v-for="(image, index) in shop" :key="index">
					<image :src="shop.shopImages"></image>
				</swiper-item>
			</swiper>
			<!-- 轮播图控制按钮 -->
			<view class="banner-controls">
				<button class="icon-button">
					<i class="chevron-left"></i>
				</button>
				<button class="icon-button">
					<i class="search"></i>
				</button>
			</view>
		</view>


		<!-- 商店信息 -->
		<view class="shop-info">
			<view class="logo-container">
				<image :src="shop.shopLogo" :alt="shop.name" class="shop-logo" />
			</view>

			<view class="details">
				<text class="shop-name">{{ shop.shopName }}</text><br>
				<text class="shop-description">{{ shop.description }}</text>
				<!-- 评分组件 -->
				<view class="rating-stars">
					<text v-for="index in 5" :key="index" class="star"
						:class="{ active: index <= Math.floor(shop.shopRating) }" @click="updateRating(index)">★</text>
					<text class="rating-score">{{ shop.shopRating }}</text>
				</view></br>
				<text class="business-hours">{{ shop.shopBusinessHours }}</text>
				<view class="address" @click="tomap">
					<i class="map-pin"></i>
					{{ shop.shopAddress }}&gt;
				</view>
			</view>
		</view>

		<!-- 服务部分 -->
		<view class="services-section">

			<view class="services-list">
				<view v-for="service in filteredServices" :key="service.id" class="service-item">
					<view class="service-icon">
						<image :src="service.tabulateImage" :alt="service.tabulateName" />
					</view>
					<view class="service-details">
						<text class="service-name">{{ service.tabulateName }}</text><br>
						<text class="service-description">{{ service.description }}</text><br>
						<text class="price">¥{{ service.tabulatePrice }}</text>
					</view>
					<button class="book-button">抢购</button>
				</view>
			</view>
		</view>


		<!-- 底部导航 -->
		<view class="bottom-nav">

			<button class="nav-item" @click="callingPhone">
				<i class="phone"></i>
				<text>电话</text>
			</button>
			<button class="nav-item">
				<i class="message"></i>
				<text>咨询</text>
			</button>
			<button class="book-now" @click="appbtn">立即预约</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userPhone:null,
				activeTab: 'all',
				shop: {},
				services: [{
						tabulateId: null,
						tabulateName: "",
						tabulateTabs: "",
						tabulateImage: "",
						tabulatePrice: null
					}

				]
			}
		},
		methods: {
			appbtn() {
				uni.navigateTo({
					url: `/pages/appointment/appointment?shopId=${this.shop.shopId}&userPhone=${this.userPhone}`
				})
			},
			callingPhone() {
				uni.makePhoneCall({
					phoneNumber: this.shop.shopPhone
				});
			},
			getStoreInfo() {
				uni.request({
					url: `http://localhost:8080/shop/${this.shop.shopId}`,
					method: 'GET',
					data: {
						shopId: this.shop.shopId
					},
					success: (res) => {
						console.log(res.data);
						this.shop = res.data.data;
					},
					fail: (err) => {
						console.log(err);
					}
				});
			},
			getServices() {
				uni.request({
					url: `http://localhost:8080/tabulate/getByShopId/${this.shop.shopId}`,
					method: 'GET',
					success: (res) => {
						console.log(res.data);
						this.services = res.data.data;
					},
					fail: (err) => {
						console.log(err);
					}
				});
			},
			tomap() {
				uni.navigateTo({
					url: "/pages/map/map"
				})
			}
		},
		onLoad(options) {
			this.shop.shopId = options.shopId;
			this.userPhone = options.userPhone;
			this.getServices()
			this.getServices()
			this.getStoreInfo()
		},
		computed: {
			filteredServices() {
				if (this.activeTab === 'all') return this.services;
				return this.services.filter(service => service.type === this.activeTab);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.shop-details {
		min-height: 100vh;
		background-color: #f5f5f5;

		.header {
			position: relative;

			.back-button {
				position: absolute;
				left: 30rpx;
				top: 60rpx;
				z-index: 10;
				width: 64rpx;
				height: 64rpx;
				background: rgba(255, 255, 255, 0.9);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			}

			.banner {
				height: 420rpx;
				background: #f0f0f0;

				image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.banner-slide {
					width: 100%;
					height: 100%;
					background-size: cover;
					background-position: center;
				}
			}
		}

		.shop-info {
			margin: -60rpx 30rpx 0;
			background: #ffffff;
			border-radius: 24rpx;
			padding: 40rpx;
			position: relative;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);

			.logo-container {
				position: absolute;
				top: -50rpx;
				left: 50%;
				transform: translateX(-50%);

				.shop-logo {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					border: 6rpx solid #fff;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
				}
			}

			.details {
				margin-top: 60rpx;
				text-align: center;

				.shop-name {
					font-size: 36rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 16rpx;
				}

				.rating-stars {
					display: inline-flex;
					align-items: center;
					padding: 4rpx 12rpx;
					background: rgba(255, 184, 0, 0.1);
					border-radius: 16rpx;
					margin-bottom: 12rpx;
					border: 1rpx solid rgba(255, 184, 0, 0.2);

					.star {
						font-size: 28rpx; // 星星大小
						color: #ccc; // 默认星星颜色
						cursor: pointer;

						&.active {
							color: #FFB800; // 激活状态下的星星颜色
						}
					}

					.rating-score {
						color: #FFB800;
						font-size: 22rpx;
						font-weight: 500;
						margin-left: 4rpx;
						position: relative;
						top: -1rpx;
					}
				}

				.business-hours {
					font-size: 26rpx;
					color: #666;
					margin-bottom: 12rpx;
				}

				.address {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8rpx;
					font-size: 26rpx;
					color: #28aff6;

					.map-pin {
						color: #999;
						font-size: 28rpx;
					}
				}
			}
		}

		.services-section {
			margin: 24rpx 30rpx;
			background: #ffffff;
			border-radius: 24rpx;
			padding: 30rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

			.tabs {
				display: flex;
				gap: 16rpx;
				margin-bottom: 24rpx;
				padding: 6rpx;
				background: #f8f8f8;
				border-radius: 16rpx;

				.tab {
					flex: 1;
					padding: 5rpx 0;
					border-radius: 30rpx;
					font-size: 26rpx;
					color: #666;
					transition: all 0.25s ease;
					border: none;
					background: transparent;

					&.active {
						background: #fff;
						color: #28aff6;
						font-weight: 500;
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
					}

					&:active {
						opacity: 0.8;
					}
				}
			}

			.services-list {
				.service-item {
					display: flex;
					align-items: center;
					padding: 24rpx 0;
					border-bottom: 1rpx solid #f5f5f5;

					&:last-child {
						border-bottom: none;
					}

					.service-icon {
						width: 120rpx;
						height: 120rpx;
						margin-right: 24rpx;

						image {
							width: 100%;
							height: 100%;
							border-radius: 12rpx;
						}
					}

					.service-details {
						flex: 1;

						.service-name {
							font-size: 30rpx;
							font-weight: 500;
							color: #333;
							margin-bottom: 8rpx;
						}

						.service-description {
							font-size: 20rpx;
							color: #999;
							margin-bottom: 12rpx;
						}

						.price {
							font-size: 32rpx;
							font-weight: 600;
							color: #ff4949;
						}
					}

					.book-button {
						min-width: 120rpx;
						height: 60rpx;
						line-height: 60rpx;
						text-align: center;
						background: #28aff6;
						color: white;
						border-radius: 30rpx;
						font-size: 26rpx;
						margin-left: 24rpx;
						transition: all 0.2s ease;

						&:active {
							transform: scale(0.98);
							opacity: 0.9;
						}
					}
				}
			}
		}

		.bottom-nav {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(255, 255, 255, 0.98);
			backdrop-filter: blur(20px);
			padding: 12rpx 24rpx calc(12rpx + env(safe-area-inset-bottom));
			display: flex;
			align-items: center;
			gap: 24rpx; // 增加间距
			z-index: 100;
			border-top: 0.5px solid rgba(0, 0, 0, 0.06);

			.nav-group {
				display: flex;
				gap: 12rpx;
				flex: 1;

				.nav-item {
					flex: 1;

					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 12rpx;
					background: #f7f7f7;
					transition: all 0.2s ease;
					border: none; // 移除默认边框


					.icon {
						font-size: 36rpx;
						color: #666;
						margin-right: 8rpx; // 图标和文字的间距
					}

					text {
						font-size: 24rpx;
						color: #666;
					}

					&:active {
						background: #f0f0f0;
						transform: scale(0.98);
					}
				}
			}

			.book-now {
				flex: 1.23;
				height: 80rpx;
				margin-left: 200rpx;
				background: #28aff6;
				color: white;
				border-radius: 12rpx;
				font-size: 28rpx;
				font-weight: 500;
				text-align: center;
				align-items: center;
				justify-content: center;
				transition: all 0.2s ease;
				box-shadow: 0 4rpx 12rpx rgba(255, 73, 73, 0.2);
				border: none;

				&:active {
					transform: scale(0.98);
					box-shadow: 0 2rpx 6rpx rgba(255, 73, 73, 0.1);
				}
			}
		}
	}
</style>