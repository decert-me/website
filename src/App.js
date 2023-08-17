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

const projectId = process.env.REACT_APP_PROJECT_ID;
const infura = process.env.REACT_APP_INFURA_API_KEY;

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, polygonMumbai, polygon],
  [
    // alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    infuraProvider({ apiKey: infura }),
    publicProvider(),
  ],
  [w3mProvider({ projectId })],
  { targetQuorum: 1 },
)

const web3modalClient = createClient({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ projectId, version: 2, chains })
  ],
  provider,
  webSocketProvider,
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

  // 语种初始化 && cache
  useEffect(() => {
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
        enableAccountView={false}
        enableExplorer={false}
      />
    </>
  )
}