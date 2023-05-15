import axios from "axios";

// Client-side-only code
let codingAxios = axios.create({
  baseURL: "http://192.168.1.15:8888/v1/",
  timeout: process.env.REACT_APP_IPFS_TIMEOUT // 请求超时设置
  //   withCredentials: false, // 跨域请求是否需要携带 cookie
});
// 创建请求拦截
codingAxios.interceptors.request.use(
  config => {
    // 如果开启 token 认证
    config.headers["x-token"] = localStorage.getItem(`decert.token`); // 请求头携带 token
    config.headers["x-lang"] = localStorage.getItem(`decert.lang`) ? localStorage.getItem(`decert.lang`) : navigator.language; // 请求头携带 token
    return config;
  },
  error => {
    Promise.reject(error);
  }
);
codingAxios.interceptors.response.use(
  res => {
    let data = res.data;
    // if (data.status !== '1') {
    //   message.error(data.message)
    //   return null
    // }
    // if (data.data.reload) {
    //   localStorage.clear();
    // }
    // 处理自己的业务逻辑，比如判断 token 是否过期等等
    // 代码块
    return data;
  }
)

export default codingAxios;