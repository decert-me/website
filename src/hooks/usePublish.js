import { useEffect, useState } from "react";
import { useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { addQuests, modifyQuests, submitHash } from "@/request/api/public";
import { constans } from "@/utils/constans";
import { createQuest, modifyQuest } from "@/controller";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useRequest, useUpdateEffect } from "ahooks";
import { pollingGetQuest } from "@/request/api/polling";



export const usePublish = (props) => {

    const { jsonHash, recommend, changeId } = props;
    const { defaultChainId } = constans();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();
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
    let [createTokenId, setCreateTokenId] = useState();
    let [createLoading, setCreateLoading] = useState();
    const { isLoading: transactionLoading, data } = useWaitForTransaction({
        hash: createQuestHash,
        cacheTime: 0
    })
    const { run, cancel } = useRequest(getChallenge, {
        pollingInterval: 1000,
        manual: true,
        pollingWhenHidden: false
    });


    function getChallenge() {
        pollingGetQuest({id: createTokenId||changeId})
        .then(res => {
            if (!changeId && res.status === 0) {
                // 创建
                cancel();
                createLoading = false;
                setCreateLoading(createLoading);
                message.success(t("message.success.create"));
                localStorage.removeItem("decert.store");
                navigateTo(`/quests/${createTokenId}`)
            }else if (res.data.uri === ("ipfs://"+jsonHash)){
                // 修改
                cancel();
                createLoading = false;
                setCreateLoading(createLoading);
                message.success(t("translation:message.success.save"));
                localStorage.removeItem("decert.store");
                navigateTo(`/quests/${changeId}`);
            }
        })
    }

    const write = (sign, obj, params) => {
        changeId ?
        modifyQuest(changeId, obj, sign, signer)
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
        :
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
        if (data && !transactionLoading) {
            if (changeId) {
                createLoading = true;
                setCreateLoading(createLoading);
                run()
            }
            data.logs.forEach(log => {
                if (log.topics[0] === "0x6bb7ff708619ba0610cba295a58592e0451dee2622938c8755667688daf3529b") {
                    createTokenId = parseInt(log.topics[1], 16);
                    setCreateTokenId(createTokenId);
                    createLoading = true;
                    setCreateLoading(createLoading);
                    run();
                }
            })
        }
    },[data])

    return {
        publish,                //  发布
        processingData,         //  合约交互
        isOk,                   //  publish 准备就绪
        isLoading,              //  发布中
        transactionLoading: transactionLoading || createLoading     //  交易上链中
    }
}