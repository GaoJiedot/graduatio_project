<template>
	<view class="container">

		<view class="tab-header">
			<view v-for="(item, index) in tabs" :key="index" :class="['tab-item', activeTab === index ? 'active' : '']"
				@click="switchTab(index)">
				{{ item }}
			</view>
		</view>

		
		<view class="tab-content">
			<view v-for="(item, index) in orderdata" :key="index" v-if="activeTab === 0" @click="toapp">
				<OrderListVue :orderdata="orderdata[index]" ></OrderListVue>
			</view>
			<view v-for="(item, index) in orderdata" :key="index" v-if="activeTab === 1">
				<OrderListVue :orderdata="orderdata[index]" ></OrderListVue>
			</view>
		</view>


	</view>
	</view>
</template>
<script>
import OrderListVue from '../../component/orderList/orderList.vue'
export default {
    components: {
        OrderListVue
    },
    data() {
        return {
            tabs: ['待使用', '已使用'],
            orderdata: [],
            activeTab: 0
        };
    },
    methods: {
       
        switchTab(index) {
            this.activeTab = index;
            this.fetchOrderData(index + 1);
        },
        toapp() {
            uni.navigateTo({
                url: '/pages/appointment/appointment'
            })
        },
        fetchOrderData(status) {
            uni.request({
                url: `http://localhost:8080/order/status/${status}`,
                method: 'GET',
                success: (res) => {
                    this.orderdata = res.data.data;
                    console.log('获取到的数据:', this.orderdata);
                },
                fail: (err) => {
                    console.error('Request failed:', err);
                }
            });
        }
    },
    onLoad() {
     
        this.fetchOrderData(1);
    }
}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;

		.tab-header {
			display: flex;
			margin-top: 30rpx;
			border-bottom: 2px solid #ddd;
		}

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 10px;
			color: #666;
			font-size: 16px;
		}

		.tab-item.active {
			color: #28aff6;
	
			border-bottom: 2px solid #28aff6;
		
		}

		.tab-content {

			font-size: 14px;
			color: #333;
		}

	}
</style>