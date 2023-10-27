import { useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { useVerifyToken } from "./useVerifyToken";
import { constans } from "@/utils/constans";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { createQuest } from "@/controller";
import { addQuests, submitHash } from "@/request/api/public";
import { useUpdateEffect } from "ahooks";
import { message } from "antd";


export default function usePublishCollection({ detail, jsonHash, collectionId }) {
    
    const { chain } = useNetwork();
    const { data: signer } = useSigner();
    const { verify } = useVerifyToken();
    const navigateTo = useNavigate();
    const { t } = useTranslation(["publish", "translation"]);
    const { defaultChainId, maxUint32, maxUint192 } = constans();
    const [isLoading, setIsLoading] = useState(false);
    const [isOk, setIsOk] = useState(false);

    let [isSwitch, setIsSwitch] = useState(false);
    let [createQuestHash, setCreateQuestHash] = useState();
    const { switchNetwork } = useSwitchNetwork({
        chainId: defaultChainId,
        onError() {
            setIsSwitch(false);
        },
        onSuccess() {
            setIsSwitch(false);
        }
    })
    const { isLoading: transactionLoading } = useWaitForTransaction({
        hash: createQuestHash,
        cacheTime: 0
    })

    const write = (sign, obj, params) => {
        createQuest(obj, sign, signer)
        .then(res => {
            setIsLoading(false);
            if (res) {
                submitHash({ 
                    hash: res,
                    params
                })
                setCreateQuestHash(res)
            }
        })
    }

    const processingData = async() => {
        const signature = await addQuests({
            uri: "ipfs://"+jsonHash,
            title: detail.title,
            description: detail.description,
            'start_ts': '0', 
            'end_ts': maxUint32.toString(), 
            'supply': maxUint192.toString(),       
        })
        const questData = {
            'startTs': 0, 
            'endTs': maxUint32.toString(), 
            'supply': maxUint192.toString(), 
            'title': detail.title,
            'uri': "ipfs://"+jsonHash, 
        }
        const params = {
            collection_id: Number(collectionId)
        }
        signature && write(signature.data, questData, JSON.stringify(params));
    }

    const publish = async() => {
        // 已登录 未签名 || 签名过期
        let hasHash = true;
        await verify()
        .catch(() => {
            hasHash = false;
        })
        if (!hasHash) {
            return
        }
        // 链不同
        if (chain.id != defaultChainId) {
            setIsSwitch(true);
            return
        }

        setIsLoading(true);
        jsonHash && await processingData();
    }

    useUpdateEffect(() => {
        detail && setIsOk(true)
    },[detail])

    useEffect(() => {
        if (isSwitch && switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork, isSwitch])

    useUpdateEffect(() => {
        if (transactionLoading) {
            setTimeout(() => {
                message.success(t("message.success.create"));
                navigateTo(0);
            }, 3000);
        }
    },[transactionLoading])

    return {
        publish,                //  发布
        processingData,         //  合约交互
        isOk,                   //  publish 准备就绪
        isLoading,              //  发布中
        transactionLoading      //  交易上链中
    }
}