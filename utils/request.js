const baseURL = 'http://localhost:8080'

const request = (options = {}) => {
  options.url = baseURL + options.url
  

  const userInfo = uni.getStorageSync('userInfo')
  const token = userInfo ? userInfo.token : null
  
  options.header = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '', 
    ...options.header
  }
  
  return uni.request(options)
}

const uploadFile = (options = {}) => {
  options.url = baseURL + options.url
  
  const userInfo = uni.getStorageSync('userInfo')
  const token = userInfo ? userInfo.token : null
  
  options.header = {
    'Authorization': token ? `Bearer ${token}` : '', 
    ...options.header
  }
  
  return uni.uploadFile(options)
}

export default {
  request,
  uploadFile
}
