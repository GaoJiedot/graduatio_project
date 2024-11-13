<template>
	<view class="container">
		<!-- 选项卡标题区域 -->
		<view class="tab-header">
			<view v-for="(item, index) in tabs" :key="index" :class="['tab-item', activeTab === index ? 'active' : '']"
				@click="switchTab(index)">
				{{ item }}
			</view>
		</view>

		<!-- 选项卡内容区域 -->
		<view class="tab-content">
			<view v-for="(item, index) in selectionlist" :key="index" v-if="activeTab === 0" @click="toapp">
				<listVue :Selectionlist="item" :orderstate= 1></listVue>
			</view>
			<view v-for="(item, index) in selectionlist" :key="index" v-if="activeTab === 1">
				<listVue :Selectionlist="item" :orderstate= 2></listVue>
			</view>
			</view>


		</view>
	</view>
</template>
<script>
	import listVue from '../../component/list/list.vue';
	export default {
		components: {
			listVue
		},
		data() {
			return {
				
				
				tabs: ['待使用', '已使用'], 
				selectionlist: [{
						id: "1",
						name: "i1111s"
					},
					{
						id: "2",
						name: "i1111s"
					}
				],

				activeTab: 0 
			};
		},
		methods: {
			switchTab(index) {
				this.activeTab = index;
				this.orderstate = index+1;
				
				
			},
			toapp() {
				uni.navigateTo({
					url: '/pages/appointment/appointment'
				})
		}
	},
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
			/* 选中状态颜色 */
			border-bottom: 2px solid #28aff6;
			/* 下边框突出显示选中项 */
		}

		.tab-content {

			font-size: 14px;
			color: #333;
		}

	}
</style>