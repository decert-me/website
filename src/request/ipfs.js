import { message } from "antd";
import axios from "axios";

// Client-side-only code
let ipfsAxios = axios.create({
  baseURL: process.env.REACT_APP_UPLOAD,
  timeout: 10000 // 请求超时设置
  //   withCredentials: false, // 跨域请求是否需要携带 cookie
});
ipfsAxios.interceptors.response.use(
  res => {
    let data = res.data;
    if (data.status !== '1') {
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

export default ipfsAxios;
