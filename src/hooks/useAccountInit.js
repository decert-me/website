import { useEffect, useState } from "react";
import { useEnsAddress, useEnsName } from "wagmi";


export const useAccountInit = (props) => {

    const { address, ensAddr } = props;
    let [status, setStatus] = useState('');  // 'idle' | 'error' | 'loading' | 'success'

    const { data: addr, isSuccess: getAddrSuccess, refetch: getAddr } = useEnsAddress({
        name: ensAddr ? ensAddr : address,
        chainId: 1,
        enabled: false,
        onError(err) {
            console.log(err);
        }
    })

    const { data: ens, isSuccess: getEnsSuccess, refetch: getEns } = useEnsName({
        address: address,
        chainId: 1,
        enabled: false
    })

    const refetch = async() => {
        console.log(ensAddr, address, props);
        if (ensAddr) {
            // ENS
            await getAddr()
            setStatus('success')
        }else if(address) {
            // ADDR
            await getAddr()
            await getEns()
            setStatus('success')
        }
    }

    useEffect(() => {
        if (address || ensAddr) {
            setStatus('idle')
        }
    },[address, ensAddr])


    return {
        status,
        addr,
        ens,
        refetch
    }

}
