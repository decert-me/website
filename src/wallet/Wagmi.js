import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';
import { polygon, polygonMumbai } from 'viem/chains';

export function Wagmi({ children }) {

    const projectId = process.env.REACT_APP_PROJECT_ID;
    const infura = process.env.REACT_APP_INFURA_API_KEY;

    const { chains, publicClient, webSocketPublicClient } = configureChains(
        [polygonMumbai, polygon],
        [infuraProvider({ apiKey: infura }),publicProvider(),]
    )

    const wagmiClient = createConfig({
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
        publicClient,
        webSocketPublicClient,
    })

    return (
        <WagmiConfig config={wagmiClient}>
            {children}
        </WagmiConfig>
    )
  }