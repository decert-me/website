import { useContext, useEffect, useState } from "react";
import { useNetwork, useSwitchNetwork, useWaitForTransaction, useContractWrite } from "wagmi";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { addQuests, modifyQuests, submitHash } from "@/request/api/public";
import { constans } from "@/utils/constans";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";
import MyContext from "@/provider/context";


export const usePublish = (props) => {

    const { jsonHash, recommend, changeId } = props;
    const { defaultChainId } = constans();
    const { questContract } = useContext(MyContext);
    const { chain } = useNetwork();
    const { verify } = useVerifyToken();
    const { ipfsPath, maxUint32, maxUint192 } = constans();
    const navigateTo = useNavigate();
    const { t } = useTranslation(["publish", "translation"]);
    const { switchNetwork } = useSwitchNetwork({
        chainId: defaultChainId,
        onError() {
            setIsSwitch(false);
        },
        onSuccess() {
            setIsSwitch(false);
        }
    })
    let [isSwitch, setIsSwitch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOk, setIsOk] = useState(false);
    
    let [detail, setDetail] = useState();
    let [createQuestHash, setCreateQuestHash] = useState();
    const { isLoading: transactionLoading } = useWaitForTransaction({
        hash: createQuestHash,
        cacheTime: 0
    })
    const { writeAsync: createQuest } = useContractWrite({
        ...questContract,
        functionName: 'createQuest',
    })

    const { writeAsync: modifyQuest } = useContractWrite({
        ...questContract,
        functionName: 'modifyQuest',
    })

    const write = (sign, obj, params) => {
        let { startTs, endTs, supply, title, uri } = obj;
        endTs = constans().maxUint32;
        supply = constans().maxUint192;
        const args = [startTs, endTs, supply, title, uri];
        if (changeId) {
            modifyQuest({ args: [changeId, args, sign] })
            .then(res => {
                setIsLoading(false);
                if (res) {
                    submitHash({
                        hash: res.hash, 
                        params: params
                    })
                    setCreateQuestHash(res)
                }
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            })
        }else{
            createQuest({ args: [args, sign] })
            .then(res => {
                setIsLoading(false);
                if (res) {
                    submitHash({
                        hash: res.hash, 
                        params: params
                    })
                    setCreateQuestHash(res)
                }
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            })
        }
    }

    const processingData = async() => {
        const signature = jsonHash && changeId ? 
        await modifyQuests({
            token_id: Number(changeId),
            uri: "ipfs://"+jsonHash,
            title: detail.title,
            description: detail.description,
            'start_ts': '0', 
            'end_ts': maxUint32.toString(), 
            'supply': maxUint192.toString(),       
        })
        :
        await addQuests({
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
            recommend: recommend
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

    const init = async() => {
        // v1.1
        let request = await axios.get(`${ipfsPath}/${jsonHash}`);
        let result = await axios.get(`${ipfsPath}/${request.data.attributes.challenge_ipfs_url.replace("ipfs://", '')}`);
        detail = result.data;
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

    useUpdateEffect(() => {
        if (transactionLoading) {
            setTimeout(() => {
                message.success(t(changeId ? "translation:message.success.save" : "message.success.create"));
                localStorage.removeItem("decert.store");
                changeId ? navigateTo(`/quests/${changeId}`) : navigateTo("/challenges")
            }, 1000);
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