import i18n from 'i18next';
import { useEffect } from "react";
import BeforeRouterEnter from "@/components/BeforeRouterEnter";
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { goerli, mainnet, polygon, polygonMumbai } from 'wagmi/chains'
// import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
// import { InjectedConnector } from 'wagmi/connectors/injected'
// import { LedgerConnector } from 'wagmi/connectors/ledger'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
// import { SafeConnector } from 'wagmi/connectors/safe'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
// import { alchemyProvider } from 'wagmi/providers/alchemy'
// import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, polygonMumbai, polygon],
  [
    // alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    // infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY! }),
    publicProvider(),
  ],
  { targetQuorum: 1 },
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    })
  ],
  provider,
  webSocketProvider,
})

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
        <BeforeRouterEnter />
      </WagmiConfig>
    </>
  )
}