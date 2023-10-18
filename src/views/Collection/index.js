import "./index.scss";
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { claimCollection, getCollectionQuest } from "@/request/api/quests";
import { constans } from "@/utils/constans";
import { Button, Tooltip, message } from "antd";
import { useAddress } from "@/hooks/useAddress";
import { getCollectionMetadata } from "@/utils/getMetadata";
import { useRequest, useUpdateEffect } from "ahooks";
import { changeConnect } from "@/utils/redux";
import { useTranslation } from "react-i18next";
import {
    ExclamationCircleOutlined
} from '@ant-design/icons';
import CollectionChallenger from "./challenger";
import CollectionInfo from "./detail";
import usePublishCollection from "@/hooks/usePublishCollection";
import { hasClaimed } from "@/request/api/public";



export default function Collection(params) {
    
    const { id } = useParams();
    const { address, walletType, isConnected } = useAddress();
    const { ipfsPath, defaultImg } = constans();
    const { t } = useTranslation(["publish", "translation", "profile"]);
    const [isCreated, setIsCreated] = useState();
    const [isWrite, setIsWrite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claimStatus, setClaimStatus] = useState(0);
    const [claimButtonText, setClaimButtonText] = useState("领取");
    const { run, cancel } = useRequest(userClaimStatus, {
        pollingInterval: 3000,
        pollingWhenHidden: false,
        manual: true,
    });

    let [progressObj, setProgressObj] = useState({
        now: 0,
        total: 0
    });
    let [detail, setDetail] = useState();
    let [createObj, setCreateObj] = useState({
        detail: null,
    });

    const { 
        publish, 
        isLoading, 
        isOk, 
        transactionLoading 
    } = usePublishCollection(createObj);


    async function userClaimStatus() {
        const res = await hasClaimed({id: detail.collection.tokenId})
        const status = res.data.status;
        const text = status === 2 ? "已领取" : status === 1 ? "空投中..." : "领取";
        setClaimButtonText(text);
        if (status === 0 || status === 2) {
            cancel();
        }
        setClaimStatus(status);
        return status
    }
    
    async function claimCollectionNft(params) {
        // 发起空投
        await claimCollection({
            token_id: detail.collection.tokenId
        })
        // 开启轮询查看空投是否成功
        run();
    }

    async function createCollectionNft(params) {

        if (walletType !== "evm") {
            message.info(t("translation:message.info.solana-publish"));
            changeConnect()
            return
        }

        const { title, description, cover, difficulty } = detail.collection;
        
        const challenges = detail.list.map(e => e.tokenId);
        
        setLoading(true);

        const ipfs = await getCollectionMetadata({
            values: {
                title,
                desc: description,
                image: cover,
                difficulty
            },
            challenges: challenges,
            address: address
        })
        createObj = {
            detail: { title, description },
            jsonHash: ipfs.hash,
            collectionId: id
        }
        setCreateObj({...createObj});
        setLoading(false);

        if (isWrite) {
            publish();
        }else{
            setIsWrite(true);
        }
    }

    async function init() {
        const res = await getCollectionQuest({id: Number(id)});
        detail = res.data;
        setDetail({...detail});
        // 是否创建了nft
        setIsCreated(detail.collection.tokenId !== 0);
    }

    useUpdateEffect(() => {
        // 当合集nft已创建、当前用户已登陆时，获取当前用户该合集进度
        if (isCreated && isConnected) {
            let now = 0;
            detail.list.map(e => {
                e.claimed && now++
            });
            progressObj = {
                now,
                total: detail.list.length
            }
            setProgressObj({...progressObj});

            // 如果合辑内挑战全部claim后，则检查该用户collection是否claim
            if (now === detail.list.length) {
                userClaimStatus()
                .then(res => {
                    // 如果状态是待空投，则开启轮询
                    if (res === 1) {
                        run();
                    }
                })
            }
        }
    },[isConnected])

    useEffect(() => {
        init();
    },[])

    useUpdateEffect(() => {
        if (isWrite && isOk) {
            publish();
        }
    },[isOk])

    return (
        detail &&
        <div className="Collection">
            <div className="custom-bg-round"></div>
            <div className="question-content">
                <div className="question-left">
                    {/* 挑战列表 */}
                    <CollectionInfo detail={detail} />
                </div>
                <div className="question-right">
                    <div className="nft">
                        <div className="img">
                            <img 
                                src={
                                    detail.collection.cover
                                    ? `${ipfsPath}/${detail.collection.cover}`
                                    : defaultImg
                                }
                                alt="" />
                        </div>
                        {/* <div className="status">
                            {detail.quest_data?.status === "updating" ? "未完结" : "完结"}
                        </div> */}
                    </div>
                    {
                        detail.collection.author === address &&
                        <Button 
                            className={isCreated ? "btn-disable" : "btn-normal"}
                            disabled={isCreated}
                            loading={isLoading || transactionLoading || loading}
                            onClick={() => createCollectionNft()}
                            style={{
                                marginTop: "30px"
                            }}
                        >
                            {isCreated ? "已创建NFT" : "创建NFT"}
                        </Button>
                    }

                    {
                        isCreated &&
                        <div className="progress">
                            <p className="progress-tips"><ExclamationCircleOutlined />完成全部挑战后可领取</p>
                            <div className="progress-info">
                                <p>进度:</p>
                                <p>{progressObj.now}/{progressObj.total}</p>
                            </div>
                        </div>
                    }

                    <Tooltip placement="top" title={!isCreated ? "等待合辑更新完后方可领取" : progressObj.total > progressObj.now ? "请先完成所有挑战" : ""}>
                        <Button 
                            className={!isCreated || progressObj.total > progressObj.now ? "btn-disable" : claimStatus === 1 ? "btn-airpost" : claimStatus === 2 ? "" : "btn-normal"}
                            disabled={!isCreated || progressObj.total > progressObj.now || claimStatus !== 0}
                            onClick={() => claimCollectionNft()}
                            style={{
                                marginTop: "30px"
                            }}
                        >{claimButtonText}</Button>
                    </Tooltip>
                    {
                        claimStatus === 1 &&
                        <div className="airpostTips">
                            将在5分钟内空投至你的钱包
                        </div>
                    }
                    {
                        claimStatus === 2 &&
                        <div className="claimedTips">
                            将NFT导入钱包
                        </div>
                    }
                    <CollectionChallenger id={detail.collection.id} />
                </div>
            </div>
        </div>
    )
}