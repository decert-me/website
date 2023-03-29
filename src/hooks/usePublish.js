import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { addQuests, submitHash } from "@/request/api/public";
import { constans } from "@/utils/constans";
import { createQuest } from "@/controller";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";



export const usePublish = (props) => {

    const { jsonHash, recommend } = props;
    const { chain } = useNetwork();
    const { data: signer } = useSigner();
    const { isConnected } = useAccount();
    const { verify } = useVerifyToken();
    const { ipfsPath, maxUint32, maxUint192 } = constans();
    const navigateTo = useNavigate();
    const { t } = useTranslation(["publish", "translation"]);
    const { switchNetwork } = useSwitchNetwork({
        chainId: Number(process.env.REACT_APP_CHAIN_ID),
        onError() {
            setIsSwitch(false);
        },
        onSuccess() {
            setIsSwitch(false);
        }
    })
    let [isSwitch, setIsSwitch] = useState(false);
    const [signIn, setSignIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOk, setIsOk] = useState(false);
    
    let [detail, setDetail] = useState();
    let [createQuestHash, setCreateQuestHash] = useState();
    const { isLoading: transactionLoading } = useWaitForTransaction({
        hash: createQuestHash,
        onSuccess() {
            setTimeout(() => {
                message.success(t("message.success.create"));
                localStorage.removeItem("decert.store");
                navigateTo("/explore")
            }, 1000);
        }
    })
    
    const cancelModalConnect = () => {
        setSignIn(false);
    }

    const write = (sign, obj, params) => {
        createQuest(obj, sign, signer)
        .then(res => {
            setIsLoading(false);
            if (res) {
                submitHash({
                    hash: res, 
                    params: params
                })
                setCreateQuestHash(res)
            }
        })
    }

    const processingData = async() => {
        const signature = jsonHash && await addQuests({
            uri: "ipfs://"+jsonHash,
            title: detail.title,
            description: detail.desc,
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
            recommend: recommend
        }
        signature && write(signature.data, questData, JSON.stringify(params));
    }

    const publish = async() => {
        // 未登录
        if (!isConnected) {
            setSignIn(true)
            return
        }
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
        if (chain.id != process.env.REACT_APP_CHAIN_ID) {
            setIsSwitch(true);
            return
        }

        setIsLoading(true);
        jsonHash && await processingData();
    }

    const init = async() => {
        let request = await axios.get(`${ipfsPath}/${jsonHash}`);
        detail = request.data;
        setDetail({...detail});
    }

    useUpdateEffect(() => {
        detail && setIsOk(true)
    },[detail])

    useEffect(() => {
        jsonHash && init();
    },[jsonHash])

    useEffect(() => {
        if (isSwitch && switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork, isSwitch])

    return {
        publish,                //  发布
        processingData,         //  合约交互
        cancelModalConnect,     //  关闭链接钱包
        isOk,                   //  publish 准备就绪
        signIn,                 //  弹出链接钱包
        isLoading,              //  发布中
        transactionLoading      //  交易上链中
    }
}