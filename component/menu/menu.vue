<template>
	<view class="container">

		<view class="menu" v-if="userInfo.userType===0">

			<view v-for="(item, index) in adminMenulist" :key="index" class="item" @click="handleAdminMenu(index)">

				<image :src="item.img" alt="" class="_img" />

				<text>{{ item.menutext }}</text>
			</view>
		</view>
		<view class="menu" v-if="userInfo.userType===1">

			<view v-for="(item, index) in marketersMenulist" :key="index" class="item"
				@click="handleMarketersMenu(index)">

				<image :src="item.img" alt="" />

				<text>{{ item.menutext }}</text>
			</view>
			<view v-if="userInfo.userType===2">
			</view>
		</view>


	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
	  props: {
	    userInfo: {
	      type: Object,
	      required: true,
	      default: () => ({
	        userType: null,
	        shopId: null
	      })
	    }
	  },
	  data() {
	    return {
	      shopStatus: null,
	      isLoading: true,
	      adminMenulist: [{
	        img: "/static/menuicon/用户.png",
	        menutext: "用户管理"
	      },
	      {
	        img: "/static/menuicon/添加.png",
	        menutext: "商家管理"
	      },
	      {
	        img: "/static/menuicon/资质.png",
	        menutext: "申请管理"
	      },
	      {
	        img: "/static/menuicon/定制.png",
	        menutext: "热门设置"
	      }],
	      marketersMenulist: [{
	        img: "/static/menuicon/店铺.png",
	        menutext: "店铺管理"
	      },
	      {
	        img: "/static/menuicon/完成.png",
	        menutext: '一键上班'  // 设置默认值
	      },
	      {
	        img: "/static/menuicon/通知.png",
	        menutext: "今日预约"
	      },
	      {
	        img: "/static/menuicon/更多.png",
	        menutext: "待开发"
	      }]
	    };
	  },
	  watch: {
	    userInfo: {
	      immediate: true,
	      handler(newVal) {
	        if (newVal && newVal.shopId) {
	          this.getShopStatus();
	        }
	      }
	    }
	  },
	  methods: {
	    getShopStatus() {
	      if (!this.userInfo.shopId&&this.userInfo.userType===1) return;
	      
	      request.request({
	        url: `/shop/${this.userInfo.shopId}`,
	        method: 'GET',
	        success: (res) => {
	          if (res.data.code === 200 && res.data.data) {
	            this.shopStatus = res.data.data.shopStatus;
	            this.switchShopStatus();
	          }
	          this.isLoading = false;
	        },
	        fail: (err) => {
	          console.error('获取店铺状态失败', err);
	          this.isLoading = false;
	        }
	      });
	    },
	
	    handleAdminMenu(index) {
	      switch (index) {
	        case 0:
	          uni.navigateTo({
	            url: '/pages/user-management/user-management'
	          });
	          break;
	        case 1:
	          uni.navigateTo({
	            url: '/pages/merchant-management/merchant-management'
	          });
	          break;
	        case 2:
	          uni.navigateTo({
	            url: '/pages/apply-management/apply-management'
	          });
	          break;
			  case 3:
			    uni.navigateTo({
			      url: '/pages/hot-search/hot-search'
			    });
			    break;
	        default:
	          uni.showToast({
	            title: '功能开发中',
	            icon: 'none',
	            duration: 1500
	          });
	      }
	    },
	
	    handleMarketersMenu(index) {
	      switch (index) {
	        case 0:
	          uni.navigateTo({
	            url: '/pages/shop-management/shop-management'
	          });
	          break;
	        case 1:
	          this.handleShopStatusToggle();
	          break;
	        case 2:
	          uni.navigateTo({
	            url: `/pages/today-appointment/today-appointment?shopId=${this.userInfo.shopId}`
	          });
	          break;
	        default:
	          uni.showToast({
	            title: '功能开发中',
	            icon: 'none',
	            duration: 1500
	          });
	      }
	    },
	
	    switchShopStatus() {
	      this.marketersMenulist[1].menutext = this.shopStatus === 0 ? "一键上班" : "一键下班";
	    },
	
	    handleShopStatusToggle() {
	      if (!this.userInfo.shopId) {
	        uni.showToast({
	          title: '店铺信息未加载',
	          icon: 'none'
	        });
	        return;
	      }
	
	      const newStatus = this.shopStatus === 0 ? 1 : 0;
	      
	      request.request({
	        url: `/shop/status`,
	        method: 'PATCH',
	        data: {
	          shopId: this.userInfo.shopId,
	          shopStatus: newStatus
	        },
	        success: (res) => {
	          if (res.data.code === 200) {
	            this.shopStatus = newStatus;
	            this.switchShopStatus();
	            uni.showToast({
	              title: res.data.message || '状态切换成功',
	              icon: 'success'
	            });
	          } else {
	            uni.showToast({
	              title: res.data.message || '切换失败',
	              icon: 'none'
	            });
	          }
	        },
	        fail: (err) => {
	          console.error('切换店铺状态失败', err);
	          uni.showToast({
	            title: '切换状态失败',
	            icon: 'none'
	          });
	        }
	      });
	    }
	  }
	};
</script>

<style lang="scss" scoped>
	.container {
		margin-top: 15rpx;
		box-shadow: 0px 0px 30px 0 rgba(140, 141, 142, .2);


		.menu {
			display: flex;
			justify-content: space-around;
			width: 100%;
			border-radius: 40rpx;

			.item {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin: 30rpx auto;

				image {
					width: 60rpx;
					height: 60rpx;

				}

				text {

					font-size: 30rpx;
					color: #333;
				}
			}
		}
	}
</style>