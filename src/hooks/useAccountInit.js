import { useEffect, useState } from "react";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";


export const useAccountInit = (props) => {

    const { address, ensAddr } = props;
    let [status, setStatus] = useState('');  // 'idle' | 'error' | 'loading' | 'success'

    const { 
        data: addr, 
        refetch: getAddr 
    } = useEnsAddress({
        name: ensAddr ? ensAddr : address,
        chainId: 1,
        enabled: false,
        onError(err) {
            console.log(err);
        }
    })

    const { 
        data: ens, 
        refetch: getEns 
    } = useEnsName({
        address: address,
        chainId: 1,
        enabled: false
    })

    const { 
        data: ensAvatar, 
        refetch: getEnsAvatar 
    } = useEnsAvatar({
        address: address,
        chainId: 1,
        enabled: false,
        onSuccess() {
            console.log(ensAvatar);
        }
    })

    const refetch = async() => {
        if (ensAddr) {
            // ENS
            await getAddr()
            // await getEnsAvatar()
            setStatus('success')
        }else if(address) {
            // ADDR
            await getAddr()
            await getEns()
            // await getEnsAvatar()
            setStatus('success')
        }
    }

    useEffect(() => {
        if ((address || ensAddr) && !status) {
            setStatus('idle')
        }
    },[address, ensAddr])


    return {
        status,
        addr,
        ens,
        ensAvatar,
        refetch
    }

}
