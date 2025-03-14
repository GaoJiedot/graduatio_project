<template>
	<view class="shop-details">

		<view class="header">
			<swiper class="banner" autoplay="true" interval="3000" circular>
				<swiper-item v-for="(image, index) in shop" :key="index">
					<image :src="shop.shopImages"></image>
				</swiper-item>
			</swiper>
			<view class="banner-controls">
				<button class="icon-button">
					<i class="chevron-left"></i>
				</button>
				<button class="icon-button">
					<i class="search"></i>
				</button>
			</view>
		</view>
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
		<view class="services-section">

			<view class="services-list">
				<view v-for="(service,index) in services" :key="index" class="service-item">
					<view class="service-icon">
						<image :src="service.tabulateImage" :alt="service.tabulateName" />
					</view>
					<view class="service-details">
						<text class="service-name">{{ service.tabulateName }}</text><br>
						<text class="service-description">{{ service.description }}</text><br>
						<text class="price">¥{{ service.tabulatePrice }}</text>
					</view>
					<button class="book-button" @click="buy(service)">抢购</button>
				</view>
			</view>
		</view>
		<view class="bottom-nav">

			<button class="nav-item" @click="callingPhone">
				<i class="phone"></i>
				<text>电话</text>
			</button>
			<button class="nav-item" @click="toMessage">
				<i class="message"></i>
				<text>咨询</text>
			</button>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				userPhone: null,
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
					url: `/pages/appointment/appointment?counterpartyId=${this.shop.shopId}`
				})
			},
			toMessage() {
				uni.navigateTo({
					url: `/pages/chat/message?shopId=${this.shop.shopId}`
				})
			},
			callingPhone() {
				uni.makePhoneCall({
					phoneNumber: this.shop.shopPhone
				});
			},
			getStoreInfo() {
				request.request({
					url: `/shop/${this.shop.shopId}`,
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
				request.request({
					url: `/tabulate/getByShopId/${this.shop.shopId}`,
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
					url: `/pages/map/map?shopName=${this.shop.shopName}&shopAddress=${this.shop.shopAddress}&shopBusinessHours=${this.shop.shopBusinessHours}`
				})
			},
			async buy(service) {
			  console.log('当前服务项目:', service);
			  if (!service || !service.tabulateName || !service.tabulatePrice) {
			    uni.showToast({
			      title: '服务信息无效',
			      icon: 'error'
			    });
			    return;
			  }
			
			  try {
			    const confirmResult = await new Promise((resolve) => {
			      uni.showModal({
			        title: '确认下单',
			        content: `您确定要购买"${service.tabulateName}"吗？\n价格: ¥${service.tabulatePrice}`,
			        success: (res) => resolve(res.confirm),
			        fail: () => resolve(false)
			      });
			    });
			
			    if (!confirmResult) return;
			    uni.showLoading({
			      title: '提交订单中...'
			    });
			    const orderData = {
			      shopId: this.shop.shopId,
			      userId: this.userId,
			      userPhone: this.userPhone,
			      orderImage: service.tabulateImage,
			      orderName: service.tabulateName,
			      orderPrice: service.tabulatePrice,
			      orderTabs: service.tabulateTabs,
			      orderStatus: 1
			    };
			
			    console.log('提交的订单数据:', orderData);		
			    const res = await request.request({
			      url: '/order',
			      method: 'POST',
			      data: orderData
			    });
			
			    uni.hideLoading();
			
			    if (res.data.code === 200) {
			      uni.showToast({
			        title: '下单成功',
			        icon: 'success',
			        duration: 2000
			      });
			    } else {
			      throw new Error(res.data.msg || '下单失败');
			    }
			
			  } catch (error) {
			    console.error('下单错误:', error);
			    uni.hideLoading();
			    uni.showToast({
			      title: error.message || '下单失败，请重试',
			      icon: 'error',
			      duration: 2000
			    });
			  }
			}
		},
		onLoad(options) {
			this.shop.shopId = options.shopId;
			this.userPhone = options.userPhone;
			this.getServices();
			this.getStoreInfo();
			uni.getStorage({
				key: 'userInfo',
					success: (res) => {
						this.userId = res.data.userId;
					}
			})
			
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
						font-size: 28rpx;
						color: #ccc;
						cursor: pointer;

						&.active {
							color: #FFB800;
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

<style lang="scss" scoped>
	.shop-details {
	  min-height: 100vh;
	  background-color: #f8f9fa;
	  padding-bottom: 120rpx;
	
	  .header {
	    position: relative;
	    
	    .banner {
	      height: 460rpx;
	      background: #e9ecef;
	      
	      image {
	        width: 100%;
	        height: 100%;
	        object-fit: cover;
	      }
	    }
	
	    .banner-controls {
	      position: absolute;
	      top: 60rpx;
	      left: 30rpx;
	      right: 30rpx;
	      display: flex;
	      justify-content: space-between;
	      z-index: 10;
	
	      .icon-button {
	        width: 72rpx;
	        height: 72rpx;
	        background: rgba(255, 255, 255, 0.95);
	        border-radius: 50%;
	        display: flex;
	        align-items: center;
	        justify-content: center;
	        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	        border: none;
	        transition: all 0.2s;
	
	        &:active {
	          transform: scale(0.95);
	          background: rgba(255, 255, 255, 0.85);
	        }
	
	        i {
	          font-size: 36rpx;
	          color: #333;
	        }
	      }
	    }
	  }
	
	  .shop-info {
	    margin: -80rpx 30rpx 0;
	    background: #ffffff;
	    border-radius: 28rpx;
	    padding: 50rpx 40rpx 40rpx;
	    position: relative;
	    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	
	    .logo-container {
	      position: absolute;
	      top: -60rpx;
	      left: 50%;
	      transform: translateX(-50%);
	
	      .shop-logo {
	        width: 120rpx;
	        height: 120rpx;
	        border-radius: 50%;
	        border: 8rpx solid #fff;
	        box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
	      }
	    }
	
	    .details {
	      margin-top: 70rpx;
	      text-align: center;
	
	      .shop-name {
	        font-size: 40rpx;
	        font-weight: 600;
	        color: #2c3e50;
	        margin-bottom: 20rpx;
	        line-height: 1.3;
	      }
	
	      .shop-description {
	        font-size: 28rpx;
	        color: #666;
	        margin-bottom: 24rpx;
	        line-height: 1.5;
	      }
	
	      .rating-stars {
	        display: inline-flex;
	        align-items: center;
	        padding: 8rpx 16rpx;
	        background: rgba(255, 184, 0, 0.08);
	        border-radius: 20rpx;
	        margin-bottom: 20rpx;
	        border: 2rpx solid rgba(255, 184, 0, 0.2);
	
	        .star {
	          font-size: 32rpx;
	          color: #ddd;
	          margin: 0 2rpx;
	          transition: color 0.2s;
	
	          &.active {
	            color: #FFB800;
	          }
	        }
	
	        .rating-score {
	          color: #FFB800;
	          font-size: 24rpx;
	          font-weight: 600;
	          margin-left: 8rpx;
	        }
	      }
	
	      .business-hours {
	        font-size: 28rpx;
	        color: #666;
	        margin-bottom: 20rpx;
	        padding: 0 30rpx;
	        line-height: 1.4;
	      }
	
	      .address {
	        display: flex;
	        align-items: center;
	        justify-content: center;
	        gap: 12rpx;
	        font-size: 28rpx;
	        color: #3498db;
	        padding: 16rpx 30rpx;
	        background: #f8f9fa;
	        border-radius: 16rpx;
	        transition: all 0.2s;
	
	        &:active {
	          background: #f0f2f5;
	        }
	
	        .map-pin {
	          font-size: 32rpx;
	          color: #3498db;
	        }
	      }
	    }
	  }
	
	  .services-section {
	    margin: 30rpx;
	    background: #ffffff;
	    border-radius: 28rpx;
	    padding: 40rpx 30rpx;
	    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
	
	    .services-list {
	      .service-item {
	        display: flex;
	        align-items: center;
	        padding: 30rpx 0;
	        border-bottom: 2rpx solid #f5f6f7;
	        transition: all 0.2s;
	
	        &:last-child {
	          border-bottom: none;
	        }
	
	        &:active {
	          background: #f8f9fa;
	        }
	
	        .service-icon {
	          width: 140rpx;
	          height: 140rpx;
	          margin-right: 30rpx;
	
	          image {
	            width: 100%;
	            height: 100%;
	            border-radius: 16rpx;
	            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	          }
	        }
	
	        .service-details {
	          flex: 1;
	
	          .service-name {
	            font-size: 32rpx;
	            font-weight: 600;
	            color: #2c3e50;
	            margin-bottom: 12rpx;
	            line-height: 1.3;
	          }
	
	          .service-description {
	            font-size: 24rpx;
	            color: #666;
	            margin-bottom: 16rpx;
	            line-height: 1.5;
	          }
	
	          .price {
	            font-size: 36rpx;
	            font-weight: 600;
	            color: #e74c3c;
	            display: flex;
	            align-items: baseline;
	
	            &::before {
	              content: '¥';
	              font-size: 24rpx;
	              margin-right: 4rpx;
	            }
	          }
	        }
	
	        .book-button {
	          min-width: 140rpx;
	          height: 68rpx;
	          line-height: 68rpx;
	          text-align: center;
	          background: #3498db;
	          color: white;
	          border-radius: 34rpx;
	          font-size: 28rpx;
	          font-weight: 500;
	          margin-left: 30rpx;
	          transition: all 0.2s;
	          border: none;
	          box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.2);
	
	          &:active {
	            transform: scale(0.96);
	            box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.15);
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
	    padding: 16rpx 30rpx calc(16rpx + env(safe-area-inset-bottom));
	    display: flex;
	    align-items: center;
	    gap: 24rpx;
	    z-index: 100;
	    border-top: 1rpx solid rgba(0, 0, 0, 0.08);
	    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
	
	    .nav-item {
	      flex: 1;
	      height: 88rpx;
	      display: flex;
	      flex-direction: column;
	      align-items: center;
	      justify-content: center;
	      border-radius: 16rpx;
	      background: #f8f9fa;
	      transition: all 0.2s;
	      border: none;
	      gap: 6rpx;
	
	      i {
	        font-size: 40rpx;
	        color: #666;
	      }
	
	      text {
	        font-size: 24rpx;
	        color: #666;
	      }
	
	      &:active {
	        background: #f0f2f5;
	        transform: scale(0.98);
	      }
	    }
	  }
	}
</style>