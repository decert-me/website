import { useEffect, useState } from "react";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";


export const useAccountInit = (props) => {

    const { address, ensAddr } = props;
    let [status, setStatus] = useState('');  // 'idle' | 'error' | 'loading' | 'success'

    const { 
        data: addr, 
        refetch: getAddr,
        status: getAddrstatus
    } = useEnsAddress({
        name: ensAddr ? ensAddr : address,
        chainId: 1,
        enabled: false,
        cacheTime: 2_000
    })

    const { 
        data: ens, 
        refetch: getEns,
        status: getEnsstatus
    } = useEnsName({
        address: address,
        chainId: 1,
        enabled: false,
        cacheTime: 2_000
    })

    const { 
        data: ensAvatar, 
        refetch: getEnsAvatar 
    } = useEnsAvatar({
        address: address,
        chainId: 1,
        enabled: false
    })

    const refetch = async() => {
        setStatus('loading')
        if (ensAddr) {
            // ENS
            await getAddr()
            // await getEnsAvatar()
        }else if(address) {
            // ADDR
            await getAddr()
            await getEns()
        }
    }

    useEffect(() => {
        if (ensAddr) {
            getAddrstatus == "error" ? setStatus('error') : setStatus('success')
        }else{
            getEnsstatus == "error" && 
            getAddrstatus == "error" ? setStatus('error') : setStatus('success')
        }
    },[getEnsstatus, getAddrstatus])

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
