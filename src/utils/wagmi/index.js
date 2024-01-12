import { CHAINS, CHAINS_TESTNET } from '@/config';
import { configureChains, createConfig, createStorage } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';


export const { publicClient, chains } = configureChains(
    process.env.REACT_APP_IS_DEV ? CHAINS_TESTNET : CHAINS,
    [publicProvider()],
    {
      batch: {
        multicall: {
          batchSize: 1024 * 200,
          wait: 16,
        },
      },
      pollingInterval: 6_000,
    },
  )

export const metaMaskConnector = new MetaMaskConnector({
    chains,
    options: {
      shimDisconnect: false,
    },
})

export const walletConnectConnector = new WalletConnectConnector({
    chains,
    options: {
      projectId: "a9f8856bf87d913f7af93c2a3e5ebb15",
      showQrModal: true
    },
})

export const noopStorage = {
    getItem: (_key) => '',
    setItem: (_key, _value) => null,
    removeItem: (_key) => null,
}

export const wagmiConfig = createConfig({
    storage: createStorage({
      storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
      key: 'wagmi',
    }),
    autoConnect: localStorage.getItem("wagmi.connected") ? true : false,
    publicClient,
    connectors: [
      metaMaskConnector,
      walletConnectConnector,
    ],
})
  