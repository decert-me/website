import { useEffect, useState } from "react";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";


export const useAccountInit = (props) => {

    const { address, ensAddr } = props;
    let [status, setStatus] = useState('');  // 'idle' | 'error' | 'loading' | 'success'
    let [addr, setAddr] = useState();
    let [ens, setEns] = useState();

    const { 
        refetch: getAddr,
        status: getAddrstatus
    } = useEnsAddress({
        name: ensAddr ? ensAddr : address,
        chainId: 1,
        enabled: false,
        cacheTime: 2_000,
        onSuccess(res){
            setAddr(res);
        }
    })

    const { 
        refetch: getEns,
        status: getEnsstatus
    } = useEnsName({
        address: address,
        chainId: 1,
        enabled: false,
        cacheTime: 2_000,
        onSuccess(res){
            setEns(res);
        }
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
        if (ens || addr) {
            if (ensAddr && getAddrstatus !== "idle") {
                status = getAddrstatus == "error" ? 'error' : 'success';
                setStatus(status);
            }else if (address && getAddrstatus !== "idle" &&  getEnsstatus !== "idle") {
                status = getAddrstatus == "error" && getEnsstatus == "error" ? 'error' : 'success';
                setStatus(status);
            }
        }
    },[getEnsstatus, getAddrstatus, ens, addr])

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
