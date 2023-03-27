import { convertToken } from "@/utils/convert";
import { GetSign } from "@/utils/GetSign"
import { useAccount, useDisconnect, useSigner } from "wagmi";



export const useVerifyToken = () => {

    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    const verify = async() => {
        
        return await new Promise( async(resolve, reject) => {
            const token = localStorage.getItem('decert.token');
            const isToken = convertToken(token);

            if (isConnected && (!token || !isToken)) {
                GetSign({address: address, signer: signer, disconnect: disconnect})
                .then(() => {
                    if (localStorage.getItem('decert.token')) {
                        resolve(true);
                    }
                })
                .catch(err => {
                    reject();
                })
            }else{
                resolve(true);
            }
        })
    }

    return {
        verify
    }
}