import { message } from "antd";
import axios from "axios";

// Client-side-only code
let nftAxios = axios.create({
  baseURL: process.env.REACT_APP_NFT_BASE_URL + process.env.REACT_APP_NFT_API,
  timeout: 30000 // 请求超时设置
  //   withCredentials: false, // 跨域请求是否需要携带 cookie
});
nftAxios.interceptors.response.use(
  res => {
    let data = res.data;
    if (data.status !== 0) {
      message.error(data.message)
      return null
    }
    // if (data.data.reload) {
    //   localStorage.clear();
    // }
    // 处理自己的业务逻辑，比如判断 token 是否过期等等
    // 代码块
    return data;
  }
)

export default nftAxios;