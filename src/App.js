import { useEffect } from "react";
import i18n from 'i18next';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';
import * as Sentry from "@sentry/react";
// 依赖
import MyProvider from './provider';
import BeforeRouterEnter from "@/components/BeforeRouterEnter";

const sentryKey = process.env.REACT_APP_SENTRY_KEY;
if (sentryKey) {
  Sentry.init({
    dsn: sentryKey,
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
      }),
      new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.REACT_APP_SENTRY_TRACES || 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: process.env.REACT_APP_SENTRY_REPLAYS_SESSION || 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR || 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

export default function App({web3Modal}) {

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
    let lang
    if (localStorage.getItem("decert.lang")) {
      lang = localStorage.getItem("decert.lang");
    }else{
      lang = navigator.language !== 'zh-CN' ? 'en-US' : 'zh-CN';
      localStorage.setItem("decert.lang",lang)
    }
    i18n.changeLanguage(lang);
    !localStorage.getItem("decert.cache") && localStorage.setItem("decert.cache", JSON.stringify({}))
  },[])
  return (
    <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
      <MyProvider web3Modal={web3Modal}>
        <BeforeRouterEnter />
      </MyProvider>
    </StyleProvider>
  )
}