<template>
	<view class="container">
		<view class="uni-textarea">
			<textarea placeholder-style="color:#bfbfbf" placeholder="占位符字体是红色的" />
		</view>
		<view class="uni-uploader">
		      <view class="uni-uploader__files">
		        <view v-for="(image, index) in imageList" :key="index">
		          <view class="uni-uploader__file" @longpress="deleteImage(index)">
		            <image class="uni-uploader__img" :src="image" @tap="previewImage(image)"></image>
		          </view>
		        </view>
		      </view>
		    </view>
		    <view class="uni-btn-v">
		      <button class="takephoto" type="primary" @tap="takePhoto">拍照</button>
		      <button class="sephoto" type="primary" @tap="chooseImage">选择图片</button>
		    </view>
			
		
			<button class="submit" type="primary">提交</button>
		
	</view>
</template>

<script>
	export default {
		data() {
		    return {
		      imageList: [],
		      showAddBtn: true
		    }
		  },
		  methods: {
		    takePhoto() {
		      uni.chooseImage({
		        count: 1,
		        sizeType: ['original', 'compressed'],
		        sourceType: ['album', 'camera'],
		        success: (res) => {
		          this.imageList.push(res.tempFilePaths[0])
		        }
		      })
		    },
		    chooseImage() {
		      uni.chooseImage({
		        count: 9,
		        sizeType: ['original', 'compressed'],
		        sourceType: ['album', 'camera'],
		        success: (res) => {
		          this.imageList = this.imageList.concat(res.tempFilePaths)
		          if (this.imageList.length >= 9) {
		            this.showAddBtn = false
		          }
		        }
		      })
		    },
		    deleteImage(index) {
		      uni.showModal({
		        title: '提示',
		        content: '是否删除图片',
		        success: (res) => {
		          if (res.confirm) {
		            this.imageList.splice(index, 1)
		          }
		        }
		      })
		    },
		    previewImage(current) {
		      uni.previewImage({
		        urls: this.imageList,
		        current
		      })
		    }
		  }
		}
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;
		.uni-textarea {
			height: 300rpx;
			background-color: #f5f5f5;
			border-radius: 10rpx;
			padding: 20rpx;
		}
		
		.uni-uploader__files {
		    display: flex;
		    flex-wrap: wrap;
		  }
		  
		  .uni-uploader__file {
		    width: 200rpx;
		    height: 200rpx;
		    margin-right: 20rpx;
		    margin-bottom: 20rpx;
		  }
		  
		  .uni-uploader__img {
		    width: 100%;
		    height: 100%;
		  }
		  
		  .uni-btn-v {
		    margin-top: 20rpx;
		    display: flex;
		    
		    .takephoto, .sephoto {
		      flex: 1;
		    }
		    
		    .takephoto {
		      margin-right: 20rpx;
		    }
		    
		    .sephoto {
		      margin-left: 20rpx;
		    }
		  }
		  .submit {
		    margin-top: 20rpx;
		    width: 100%;
		    height: 80rpx;
		    background-color: #007aff;
		    color: #fff;
		    border-radius: 10rpx;
		    line-height: 80rpx;
		    text-align: center;
		  }
	}

	
</style>