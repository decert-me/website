import i18n from 'i18next';
import { useEffect } from "react";
import BeforeRouterEnter from "@/components/BeforeRouterEnter";
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { goerli, mainnet, polygon, polygonMumbai } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { infuraProvider } from 'wagmi/providers/infura'
import MyProvider from './provider';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import * as Sentry from "@sentry/react";

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


const projectId = process.env.REACT_APP_PROJECT_ID;
const infura = process.env.REACT_APP_INFURA_API_KEY;

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, polygonMumbai, polygon],
  [
    // alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    infuraProvider({ apiKey: infura }),
    publicProvider(),
  ],
  { targetQuorum: 1 },
)
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const web3modalClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  // webSocketProvider,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: projectId,
        showQrModal: true
      },
    }),
  ],
  provider,
  webSocketProvider,
})

const ethereumClient = new EthereumClient(web3modalClient, chains)

export default function App() {
  window.Buffer = window.Buffer || require("buffer").Buffer;

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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      // e.returnValue = ''; // 必须设置一个空字符串，否则浏览器可能会显示默认的提示消息
      localStorage.removeItem("wagmi.cache");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
          <MyProvider>
            <BeforeRouterEnter />
          </MyProvider>
        </StyleProvider>
      </WagmiConfig>
      <Web3Modal 
        projectId={projectId} 
        ethereumClient={ethereumClient}
        // enableAccountView={false}
        // enableExplorer={false}
      />
    </>
  )
}