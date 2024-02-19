import { CHAINS, CHAINS_TESTNET } from '@/config';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, createStorage } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { particleWallet } from "@particle-network/rainbowkit-ext";
import { ParticleNetwork } from '@particle-network/auth';
import "@rainbow-me/rainbowkit/styles.css";

export const particle = new ParticleNetwork({
  projectId: process.env.REACT_APP_PROJECT_ID,
  clientKey: process.env.REACT_APP_CLIENT_KEY,
  appId: process.env.REACT_APP_APP_ID,
});

const projectId = "a9f8856bf87d913f7af93c2a3e5ebb15";


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

const particleWallets = [
  particleWallet({ chains, authType: "email" }),
  particleWallet({ chains, authType: "phone" }),
  particleWallet({ chains, authType: "github" }),
  particleWallet({ chains, authType: "google" }),
  particleWallet({ chains, authType: "twitter" }),
  particleWallet({ chains, authType: "discord" }),
  particleWallet({ chains, authType: "facebook" }),
  particleWallet({ chains, authType: "apple" }),
  particleWallet({ chains, authType: "microsoft" }),
  particleWallet({ chains, authType: "linkedin" })
];

export const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      // walletConnectWallet({ projectId, chains }),
      {...walletConnectWallet({ projectId, chains }), id: "solana"},
    ],
  },
  {
    groupName: 'Others',
    wallets: particleWallets,
  },
]);

export const AppInfo = {
  appName: "Rainbowkit Demo",
  // learnMoreUrl?: string;
  // disclaimer?: DisclaimerComponent;
};

export const wagmiConfig = createConfig({
    storage: createStorage({
      storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
      key: 'wagmi',
    }),
    autoConnect: localStorage.getItem("wagmi.connected") ? true : false,
    publicClient,
    connectors
    // connectors: [
    //   metaMaskConnector,
    //   walletConnectConnector,
    // ],
})
  