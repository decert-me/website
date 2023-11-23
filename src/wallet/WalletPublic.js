import { Wagmi } from "./Wagmi";
import { Web3ModalProvider } from "./Web3ModalProvider";

export function WalletPublic({ children }) {
    
    const isMobile = window.innerWidth < 480;
    
    return isMobile ? (
        <Web3ModalProvider>
            {children}
        </Web3ModalProvider>
      ) : (
        <Wagmi>
            {children}
        </Wagmi>
      );
}