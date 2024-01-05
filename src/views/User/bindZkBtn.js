


import { getAddressDid, saveSignAndDid } from "@/request/api/zk";
import { createDID } from "@/utils/zk/createDID";
import { Button } from "antd";
import { useEffect, useState } from "react";
import { useSigner } from "wagmi";



export default function BindZkBtn() {
    
    const { data: signMessage } = useSigner();
    const [isZkLoad, setIsZkLoad] = useState(false);
    const [isBind, setIsBind] = useState(false);


    async function bindZkAc(params) {
        setIsZkLoad(true);
        const { message, did } = await createDID();
        // 发起签名
        try {
            const sign_hash = await signMessage?.signMessage(message)
            // 保存签名&DID
            await saveSignAndDid({
                sign: message,
                sign_hash: sign_hash,
                did_address: did
            })
            .then(res => {
                setIsBind(true);
            })
        } catch (error) {
            console.error(error);
            setIsZkLoad(false);
        }
        setIsZkLoad(false);
    }

    function init() {
        getAddressDid()
        .then(res => {
            if (res.data.did) {
                setIsBind(true);
            }
        })
    }

    useEffect(() => {
        init();
    },[])

    return (
        <Button
            id="hover-btn-full" 
            className={isBind ? "isBind" : ""}
            onClick={() => bindZkAc()}
            loading={isZkLoad}
            disabled={isBind}
        >{isBind ? "已绑定" : "Connect Account"}</Button>
    )
}