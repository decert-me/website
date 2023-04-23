import store, { showCustomSigner } from "@/redux/store";
import { convertToken } from "@/utils/convert";
import { useAccount } from "wagmi";

export const useVerifyToken = () => {

    const { isConnected } = useAccount();

    const verify = async() => {
        
        return await new Promise( async(resolve, reject) => {
            const token = localStorage.getItem('decert.token');
            const isToken = convertToken(token);

            if (isConnected && (!token || !isToken)) {
                await store.dispatch(showCustomSigner());
                reject();
            }else{
                resolve(true);
            }
        })
    }

    return {
        verify
    }
}