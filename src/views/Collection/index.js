import "./index.scss";
import { useParams } from "react-router-dom"
import { useContext, useEffect, useState } from "react";
import { claimCollection, getCollectionQuest } from "@/request/api/quests";
import { constans } from "@/utils/constans";
import { Button, Tooltip, message, notification } from "antd";
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
import MyContext from "@/provider/context";
import { useProvider, useSigner } from "wagmi";



export default function Collection(params) {
    
    const { id } = useParams();
    const { isMobile } = useContext(MyContext);
    const { data: signer } = useSigner()
    const { address, walletType, isConnected } = useAddress();
    const { ipfsPath, defaultImg, openseaLink } = constans();
    const [api, contextHolder] = notification.useNotification();
    const { t } = useTranslation(["publish", "translation", "profile", "explore"]);
    const [isCreated, setIsCreated] = useState();
    const [isWrite, setIsWrite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claimStatus, setClaimStatus] = useState(0);
    const [claimButtonText, setClaimButtonText] = useState(0);
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
        // const text = status === 2 ? t("explore:pass") : status === 1 ? "空投中..." : "领取";
        setClaimButtonText(status);
        if (status === 0 || status === 2) {
            cancel();
        }
        setClaimStatus(status);
        return status
    }
    
    async function claimCollectionNft(params) {
        // 未链接钱包
        if (!address) {
            changeConnect();
            return
        }
        // 未完成
        if (progressObj.total > progressObj.now) {
            api.info({
                message: t("explore:notice"),
                description: "",
                placement: "topRight",
            });
            return
        }
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
        // 判断id是collectionID还是uuid
        let collectionId = Number(id);
        if (isNaN(collectionId)) {
            collectionId = id;
        }
        const res = await getCollectionQuest({id: collectionId});
        detail = res.data;
        setDetail({...detail});
        progressObj.now = 0;
        progressObj.total = detail.list.length;
        setProgressObj({...progressObj});
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
    },[isCreated, isConnected])

    useEffect(() => {
        init();
    },[])
    
    useUpdateEffect(() => {
        !isConnected && init();
    },[isConnected])

    useUpdateEffect(() => {
        if (isWrite && isOk) {
            publish();
        }
    },[isOk])

    return (
        detail &&
        <div className={`Collection ${isMobile ? "Collection-mobile" : ""}`}>
            {contextHolder}
            <div className="custom-bg-round"></div>
            <div className="question-content">
                <div className="question-left">
                    {/* 挑战列表 */}
                    <CollectionInfo 
                        detail={detail} 
                        isCreated={isCreated}
                    />
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
                            {
                                isCreated && detail?.collection.claimed &&
                                <a 
                                    target="_blank"
                                    href={openseaLink+"/"+detail?.collection.tokenId} 
                                    className="badge">
                                    <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                                </a>
                            }
                        </div>
                    </div>
                    {
                        detail.collection.author === address && !isCreated &&
                        <Button 
                            className={isCreated ? "btn-disable" : "btn-normal"}
                            disabled={isCreated}
                            loading={isLoading || transactionLoading || loading}
                            onClick={() => createCollectionNft()}
                            style={{
                                marginTop: "30px"
                            }}
                        >
                            {isCreated ? t("explore:btn.created-nft") : t("explore:btn.create-nft")}
                        </Button>
                    }

                    {
                        isCreated &&
                        <div className="progress">
                            <p className="progress-tips"><ExclamationCircleOutlined />{t("explore:btn.complet")}</p>
                            <div className="progress-info">
                                <p>{t("explore:progress")}:</p>
                                <p>{progressObj.now}/{progressObj.total}</p>
                            </div>
                        </div>
                    }
                    {/*  : progressObj.total > progressObj.now || !address ? "请先完成所有挑战" */}
                    <Tooltip placement="top" title={!isCreated ? t("explore:btn.complet") : ""} getPopupContainer={() => document.querySelector(".question-right")}>
                        <Button 
                            className={address && !isCreated ? "btn-disable" : claimStatus === 1 ? "btn-airpost" : claimStatus === 2 ? "" : "btn-normal"}
                            disabled={address && (!isCreated || claimStatus !== 0)}
                            onClick={() => claimCollectionNft()}
                            style={{
                                marginTop: "30px"
                            }}
                        >{claimButtonText === 2 ? t("explore:pass") :
                            claimButtonText === 1 ? t("explore:airdropping") : 
                            t("explore:btn.claim")
                        }</Button>
                    </Tooltip>
                    {
                        claimStatus === 1 &&
                        <div className="airpostTips">
                            {t("explore:airdrop")}
                        </div>
                    }
                    {/* {
                        claimStatus === 2 &&
                        <div className="claimedTips">
                            将NFT导入钱包
                        </div>
                    } */}
                    <CollectionChallenger id={detail.collection.id} />
                </div>
            </div>
        </div>
    )
}