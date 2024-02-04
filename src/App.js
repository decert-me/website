import { useEffect } from "react";
import BeforeRouterEnter from "@/components/BeforeRouterEnter";
import MyProvider from './provider';
import "@/assets/styles/container.scss"
import "@/assets/styles/mobile/container.scss"

export default function App() {

  function localInit(params) {
    // 测试1mb大小local空间
    try {
      localStorage.setItem('decert.test', 'a'.repeat(1 * 1024 * 1024));
      localStorage.removeItem('decert.test');
    } catch (error) {   
      var size = 0;
      for(const item in window.localStorage) {
        if(window.localStorage.hasOwnProperty(item)) {
          const itemSize = window.localStorage.getItem(item).length;
          size += itemSize
          console.log(item + "===>" + (itemSize / 1024).toFixed(2) + 'KB');
        }
      }
      console.log('当前localStorage已用' + (size / 1024).toFixed(2) + 'KB');
      localStorage.removeItem("wagmi.cache");
    }
  }

  // 语种初始化 && cache
  useEffect(() => {
    localInit()
    !localStorage.getItem("decert.cache") && localStorage.setItem("decert.cache", JSON.stringify({}))
  },[])

  return (
    <MyProvider>
      <BeforeRouterEnter />
    </MyProvider>
  )
}