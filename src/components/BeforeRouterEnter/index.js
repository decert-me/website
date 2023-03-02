import { useAccount, useDisconnect, useSigner } from "wagmi";
import DefaultLayout from "@/containers/DefaultLayout";
import { convertToken } from "../../utils/convert";
import { GetSign } from "../../utils/GetSign";


export default function BeforeRouterEnter() {
  
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: signer } = useSigner();


    const token = localStorage.getItem(`decert.token`);
    
    // Connected unSign or token invalid
    if (isConnected && (!token || !convertToken(token))) {
        GetSign({address: address, signer: signer, disconnect: disconnect})
    }

    return (
        <DefaultLayout />
    )
}