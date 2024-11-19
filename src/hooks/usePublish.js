import axios from "axios";
import { useEffect, useState } from "react";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { addQuests, modifyQuests, submitHash } from "@/request/api/public";
import { constans } from "@/utils/constans";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRequest, useUpdateEffect } from "ahooks";
import { pollingGetQuest } from "@/request/api/polling";
import { CONTRACT_ADDR_721, CONTRACT_ADDR_721_TESTNET } from "@/config";
import { questMinterABI } from "@/config/abi/721/QuestMinter";



export const usePublish = (props) => {

    const isDev = process.env.REACT_APP_IS_DEV;
    const { jsonHash, recommend, category, changeId, clear } = props;
    const { ipfsPath, maxUint32 } = constans();
    const { chain } = useNetwork();
    const { verify } = useVerifyToken();
    const navigateTo = useNavigate();
    const { t } = useTranslation(["publish", "translation"]);
    const dataBase = "publish";

    const [isLoading, setIsLoading] = useState(false);
    const [isOk, setIsOk] = useState(false);
    const [uuid, setUuid] = useState("");
    
    let [detail, setDetail] = useState();
    let [createQuestHash, setCreateQuestHash] = useState();
    let [createTokenId, setCreateTokenId] = useState();
    let [createLoading, setCreateLoading] = useState();
    const { isLoading: transactionLoading, data } = useWaitForTransaction({
        hash: createQuestHash?.hash,
        cacheTime: 0
    })
    const { run, cancel } = useRequest(getChallenge, {
        pollingInterval: 1000,
        manual: true,
        pollingWhenHidden: false
    });


    const { writeAsync: createQuest } = useContractWrite({
        address: isDev ? CONTRACT_ADDR_721_TESTNET[chain?.id]?.QuestMinter : CONTRACT_ADDR_721[chain?.id]?.QuestMinter,
        abi: questMinterABI,
        functionName: 'createQuest',
    })

    const { writeAsync: modifyQuest } = useContractWrite({
        address: isDev ? CONTRACT_ADDR_721_TESTNET[chain?.id]?.QuestMinter : CONTRACT_ADDR_721[chain?.id]?.QuestMinter,
        abi: questMinterABI,
        functionName: 'modifyQuest',
    })



    function getChallenge() {
        pollingGetQuest({id: createTokenId||changeId})
        .then(res => {
            if (!changeId && res.status === 0) {
                // 创建
                cancel();
                localStorage.removeItem("decert.store");
                createLoading = false;
                setCreateLoading(createLoading);
                message.success(t("message.success.create"));
                navigateTo(`/quests/${createTokenId}`)
            }else if (res.data.uri === ("ipfs://"+jsonHash)){
                // 修改
                cancel();
                localStorage.removeItem("decert.store");
                createLoading = false;
                setCreateLoading(createLoading);
                message.success(t("translation:message.success.save"));
                navigateTo(`/quests/${changeId}`);
            }
        })
    }

    const write = (sign, obj, params) => {
        let { startTs, endTs, title, uri } = obj;
        const args = [startTs, endTs, title, uri];
        if (changeId) {
            modifyQuest({ args: [changeId, args, sign] })
            .then(res => {
                setIsLoading(false);
                if (res) {
                    submitHash({
                        hash: res.hash, 
                        params: params,
                        chain_id: chain.id
                    })
                    setCreateQuestHash(res)
                }
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
                clear();
                setIsOk(false);
            })
        }else{
            createQuest({ args: [args, sign] })
            .then(res => {
                setIsLoading(false);
                if (res) {
                    submitHash({
                        hash: res.hash, 
                        params: params,
                        chain_id: chain.id
                    })
                    setCreateQuestHash(res)
                }
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
                clear();
                setIsOk(false);
            })
        }
    }

    const processingData = async() => {
        console.log(detail);
        const signature = jsonHash && changeId ? 
        await modifyQuests({
            token_id: changeId,
            uri: "ipfs://"+jsonHash,
            title: detail.title,
            description: detail.description,
            'start_ts': '0', 
            'end_ts': maxUint32.toString(), 
            chain_id: chain.id   
        })
        :
        await addQuests({
            uri: "ipfs://"+jsonHash,
            title: detail.title,
            description: detail.description,
            'start_ts': '0', 
            'end_ts': maxUint32.toString(),
            chain_id: chain.id
        })
        const questData = {
            'startTs': 0, 
            'endTs': maxUint32.toString(), 
            'title': detail.title,
            'uri': "ipfs://"+jsonHash, 
        }
        const params = {
            recommend: recommend,
            category: category
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

        setIsLoading(true);
        jsonHash && await processingData();
    }

    const init = async() => {
        // v1.1
        try {            
            let request = await axios.get(`${ipfsPath}/${jsonHash}`);
            const uuid = request.data.attributes.challenge_url.replace("https://decert.me/quests/","")
            setUuid(uuid);
            let result = await axios.get(`${ipfsPath}/${request.data.attributes.challenge_ipfs_url.replace("ipfs://", '')}`);
            detail = result.data;
            console.log(result);
            setDetail({...detail});
        } catch (error) {
            console.log(error);
        }
    }

    useUpdateEffect(() => {
        detail && setIsOk(true)
    },[detail])

    useEffect(() => {
        jsonHash && init();
    },[jsonHash])

    useUpdateEffect(() => {
        if (data && !transactionLoading) {
            if (changeId) {
                createLoading = true;
                setCreateLoading(createLoading);
                run()
            }else{
                createTokenId = uuid;
                setCreateTokenId(createTokenId);
                createLoading = true;
                setCreateLoading(createLoading);
                run();
            }
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