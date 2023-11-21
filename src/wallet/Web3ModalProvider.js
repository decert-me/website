import { Web3Modal } from '@web3modal/react';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'viem/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';

export function Web3ModalProvider({ children }) {

    const projectId = process.env.REACT_APP_PROJECT_ID;
    const infura = process.env.REACT_APP_INFURA_API_KEY;

    const { chains } = configureChains(
        [polygonMumbai, polygon],
        [infuraProvider({ apiKey: infura }),publicProvider(),]
    )

    const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
    const web3modalClient = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains }),
      publicClient,
      // webSocketProvider,
    })
    
    const ethereumClient = new EthereumClient(web3modalClient, chains)

    return (
        <>
            {children}
            <Web3Modal 
                projectId={projectId} 
                ethereumClient={ethereumClient}
                // enableAccountView={false}
                // enableExplorer={false}
            />
        </>
    )
  }