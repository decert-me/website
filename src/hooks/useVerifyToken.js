import store, { showCustomSigner } from "@/redux/store";
import { convertToken } from "@/utils/convert";
import { useAddress } from "./useAddress";

export const useVerifyToken = () => {

    const { isConnected } = useAddress();

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