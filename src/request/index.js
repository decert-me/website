import store, { setDisConnect } from "@/redux/store.js";
import { message } from "antd";
import axios from "axios";
import { ClaimShareError } from "../components/CustomMessage/index.js";
import serverConfig from "./config.js";

// Client-side-only code
console.log('[DEBUG] serviceAxios baseURL:', serverConfig?.baseURL, 'from env:', process.env.REACT_APP_BASE_URL);
let serviceAxios = axios.create({
  baseURL: serverConfig?.baseURL,
  timeout: 120000 // 请求超时设置
  //   withCredentials: false, // 跨域请求是否需要携带 cookie
});
// 创建请求拦截
serviceAxios.interceptors.request.use(
  config => {
    console.log('[DEBUG] Request to:', config.baseURL + config.url);
    // 如果开启 token 认证
    if (serverConfig.useTokenAuthorization) {
      config.headers["x-token"] = localStorage.getItem(`decert.token`); // 请求头携带 token
      config.headers["x-lang"] = localStorage.getItem(`decert.lang`) ? localStorage.getItem(`decert.lang`) : navigator.language; // 请求头携带 token
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
// 创建响应拦截
serviceAxios.interceptors.response.use(
  res => {
    let data = res.data;
    if (data.status !== 0) {
      if (data.data?.reload) {
        store.dispatch(setDisConnect(true));
        return Promise.reject(new Error('需要重新连接'));
      }
      if (res.config.url === '/users/discord' && res.config.data.indexOf('isClick') === -1) {
        return Promise.reject(new Error('Discord 验证失败'));
      }
      if (res.config.url === '/badge/submitClaimTweet' && data.message === '推文不匹配') {
        ClaimShareError()
        return Promise.reject(new Error('推文不匹配'));
      }
      message.error(data.message);
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    // if (data.data.reload) {
    //   localStorage.clear();
    // }
    // 处理自己的业务逻辑，比如判断 token 是否过期等等
    // 代码块
    return data;
  },
  error => {
    console.error('[DEBUG] Request error:', error);
    let errorMessage = "";
    if (error && error.response) {
      switch (error.response.status) {
        case 302:
          errorMessage = "接口重定向了！";
          break;
        case 400:
          errorMessage = "参数不正确！";
          break;
        case 401:
          errorMessage = "您未登录，或者登录已经超时，请先登录！";
          break;
        case 403:
          errorMessage = "您没有权限操作！";
          break;
        case 404:
          errorMessage = `请求地址出错: ${error.response.config.url}`;
          break;
        case 408:
          errorMessage = "请求超时！";
          break;
        case 409:
          errorMessage = "系统已存在相同数据！";
          break;
        case 500:
          errorMessage = "服务器内部错误！";
          break;
        case 501:
          errorMessage = "服务未实现！";
          break;
        case 502:
          errorMessage = "网关错误！";
          break;
        case 503:
          errorMessage = "服务不可用！";
          break;
        case 504:
          errorMessage = "服务暂时无法访问，请稍后再试！";
          break;
        case 505:
          errorMessage = "HTTP 版本不受支持！";
          break;
        default:
          errorMessage = "异常问题，请联系管理员！";
          break;
      }
    }
    // console.log(error.response.config.baseURL+error.response.config.url);
    return Promise.reject(errorMessage);
  }
);

export default serviceAxios;
