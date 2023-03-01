// import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
// import { Web3Button, Web3Modal, Web3NetworkSwitch } from '@web3modal/react'
// import { configureChains, createClient, goerli, WagmiConfig } from 'wagmi'
// import { arbitrum, avalanche, bsc, fantom, gnosis, mainnet, optimism, polygon } from 'wagmi/chains'
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
// import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
// import { infuraProvider } from 'wagmi/providers/infura'
// import { publicProvider } from 'wagmi/providers/public'
// import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import BeforeRouterEnter from "@/components/BeforeRouterEnter";


// // 1. Get projectID at https://cloud.walletconnect.com
// if (!process.env.REACT_APP_PROJECT_ID) {
//   throw new Error('You need to provide REACT_APP_PROJECT_ID env variable')
// }
// const projectId = process.env.REACT_APP_PROJECT_ID

// // 2. Configure wagmi client
// const defaultChains = [mainnet, polygon, avalanche, optimism, goerli]

// const { provider, chains, webSocketProvider } = configureChains([...defaultChains,
//   {
//     id: 5,
//     name: 'goerli',
//     network: 'goerli',
//     rpcUrls: {
//       default: 'https://rpc.ankr.com/eth_goerli'
//     }
//   }
// ], [
//   walletConnectProvider({ projectId }),
//   infuraProvider({ apiKey: '9aa3d95b3bc440fa88ea12eaa4456161', priority: 0 }),
//   jsonRpcProvider({
//     rpc: (chain) => ({ http: chain.rpcUrls.default }),
//   })
//   // infuraProvider({ apiKey: process.env.REACT_APP_INFURA_API_KEY }),
//   // publicProvider(),
//   // jsonRpcProvider({
//   //     rpc: (chain) => ({ http: chain.rpcUrls.default }),
//   // })
// ])
// const wagmiClient = createClient({
//   autoConnect: true,
//   connectors: [
//     new MetaMaskConnector({ chains }),
//     new WalletConnectConnector({
//       chains,
//       options: {
//         qrcode: true,
//         version: '1',
//         projectId: projectId,
//         // rpc: (chain) => ({ http: chain.rpcUrls.default })
//       },
//     })
//   ],
//   provider,
//   webSocketProvider
// })

// // 3. Configure modal ethereum client
// // const ethereumClient = new EthereumClient(wagmiClient, chains)

// // 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
// export default function App() {
//   return (
//     <>
//       <WagmiConfig client={wagmiClient}>
//         {/* <Web3Button /> */}
//         {/* <br /> */}
//         {/* <Web3NetworkSwitch /> */}
//         {/* <br /> */}
//         <BeforeRouterEnter />
//       </WagmiConfig>

//       {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
//     </>
//   )
// }
// import type { AppProps } from 'next/app'
// import NextHead from 'next/head'
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { avalanche, goerli, mainnet, optimism } from 'wagmi/chains'

import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { LedgerConnector } from 'wagmi/connectors/ledger'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { SafeConnector } from 'wagmi/connectors/safe'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, optimism, avalanche],
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

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        {/* <Web3Button /> */}
        {/* <br /> */}
        {/* <Web3NetworkSwitch /> */}
        {/* <br /> */}
        <BeforeRouterEnter />
      </WagmiConfig>

      {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
    </>
  )
}