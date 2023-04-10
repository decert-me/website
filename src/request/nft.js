import store, { showCustomSigner } from "@/redux/store";
import { message } from "antd";
import axios from "axios";

// Client-side-only code
let nftAxios = axios.create({
  baseURL: process.env.REACT_APP_NFT_BASE_URL + process.env.REACT_APP_NFT_API,
  timeout: 120000 // 请求超时设置
  //   withCredentials: false, // 跨域请求是否需要携带 cookie
});
// 创建请求拦截
nftAxios.interceptors.request.use(
  config => {
    // 如果开启 token 认证
    config.headers["x-token"] = localStorage.getItem(`decert.token`); // 请求头携带 token
    return config;
  },
  error => {
    Promise.reject(error);
  }
);
nftAxios.interceptors.response.use(
  res => {
    let data = res.data;
    if (data.data.reload) {
      store.dispatch(showCustomSigner());
      return
    }
    if (data.status !== 0) {
      message.error(data.message)
      return null
    }
    
    // 处理自己的业务逻辑，比如判断 token 是否过期等等
    // 代码块
    return data;
  }
)

export default nftAxios;