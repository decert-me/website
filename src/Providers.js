import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "./utils/wagmi";




export default function Providers({children}) {
    
    return (
        <WagmiConfig config={wagmiConfig}>
            {children}
        </WagmiConfig>
    )
}