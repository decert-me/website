import React from 'react';
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'viem/chains';


export function Web3ModalProvider({ children }) {

    const projectId = process.env.REACT_APP_PROJECT_ID;

    const metadata = {
        name: 'Web3Modal',
        description: 'Web3Modal Example',
        url: 'https://web3modal.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
    }

    const chains = [polygonMumbai, polygon];
    const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

    createWeb3Modal({ wagmiConfig, projectId, chains })
    const web3Modal = useWeb3Modal();

    const childrenWithProps = React.Children.map(children, child =>
        React.cloneElement(child, { web3Modal })
    );
    
    return (
        <WagmiConfig config={wagmiConfig}>
            {childrenWithProps}
        </WagmiConfig>
    )
  }