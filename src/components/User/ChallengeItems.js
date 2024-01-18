import { useEffect, useState } from "react"
import "@/assets/styles/mobile/component-style/user/challengeItem.scss"
import "@/assets/styles/component-style/index"
import { ClockCircleFilled } from '@ant-design/icons';
import { convertTime } from "@/utils/convert";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { constans } from "@/utils/constans";
import { getCollectionQuest } from "@/request/api/quests";
import { useNavigate } from "react-router-dom";
import { hashAvatar } from "@/utils/HashAvatar";
import { hasClaimed } from "@/request/api/public";


export default function ChallengeItems({info, goCollection}) {
    

    const navigateTo = useNavigate();
    const { ipfsPath, imgPath } = constans();
    const { t } = useTranslation(["profile", "explore"]);
    let [collectionInfo, setCollectionInfo] = useState({
        questNum: 0, claimable: false, claimed: false
    });
    const arr = [0, 1, 2];

    function getTimeDiff(time) {
        const { type, time: num } = convertTime(time, "all")

        return (
            <>
                {t(`translation:${type}`, {time: Math.round(num)})}
            </>
        )
    }

    async function init(params) {
        // 获取本地缓存已完成的
        let local = localStorage.getItem("decert.cache");
        if (local) {
            local = JSON.parse(local).claimable;
        }
        let tokenId;
        await getCollectionQuest({id: Number(info.id)})
        .then(res => {
            if (res.status === 0) {
                const list = res.data.list || [];
                collectionInfo.questNum = list.length;
                tokenId = res.data.collection.tokenId;
                if (tokenId && tokenId !== "0") {
                    collectionInfo.claimable = !list.some(e => !e.claimed);
                }
                setCollectionInfo({...collectionInfo});
            }
        })
        if (tokenId && tokenId !== "0") {            
            hasClaimed({id: tokenId})
            .then(res => {
                const status = res.data.status;
                if (status === 2) {
                    collectionInfo.claimed = true;
                    setCollectionInfo({...collectionInfo});
                }
            })
        }
    }

    useEffect(() => {
        init();
    },[])

    return (
        <div className="ChallengeItem" onClick={() => goCollection(info.id)}>
            {
                collectionInfo.claimable && collectionInfo.questNum !== 0 &&
                <div className="item-claimable">
                    {t("claimble")}
                </div>
            }
            {
                collectionInfo.claimed && collectionInfo.questNum !== 0 && 
                <div className="item-claimed">
                    {t("explore:pass")}
                </div>
            }
            <div className="right-sbt challenge-img">
                <div className="img">
                        <LazyLoadImage
                            src={`${ipfsPath}/${info.cover}`}
                        />
                </div>
                <div className="sbt-bottom">
                    <div>
                        <img src={require("@/assets/images/icon/icon-collection.png")} alt="" />
                    </div>
                    <div>
                        <img src={require("@/assets/images/icon/icon-challenge.png")} alt="" />
                        <p>{collectionInfo.questNum}</p>
                    </div>
                </div>
            </div>
            <div className="left-info">
                <div>
                    <p className="title newline-omitted">
                        {info.title}
                    </p>
                    <p className="desc newline-omitted">
                        {info.description}
                    </p>
                </div>
                <div className="collection-author">
                    {
                        info.author_info.avatar &&
                        <div className="img">
                            <img src={imgPath + info.author_info.avatar} alt="" />
                        </div>
                    }
                    <p>{info.author_info.nickname}</p>
                </div>
                <div className="sbt-detail">
                    <div className='flex'>
                        {
                            info?.difficulty !== null && 
                            <>
                            <span>{t("translation:diff")}</span>
                            <div className="imgs">
                                {
                                    arr.map((e,i) => {
                                        if (i >= info?.difficulty+1) {
                                            return <img key={i} src={require("@/assets/images/icon/star-line.png")} alt="" />
                                        }else{
                                            return <img key={i} src={require("@/assets/images/icon/star-full.png")} alt="" />
                                        }
                                    })
                                }
                            </div>
                            </>
                        }
                    </div>
                    <div className="time">
                        {
                            info?.estimate_time !== null && 
                            <>
                                <ClockCircleFilled />
                                {getTimeDiff(info?.estimate_time)}
                            </>
                        }
                    </div>
                    {/* 
                    <div className="date">
                        <div className="icon img">
                            <img src={require("@/assets/images/icon/yes.png")} alt="" />
                        </div>
                        {formatTimeToStrYMD(info.complete_ts ? info.complete_ts : info.addTs)}
                    </div> */}
                </div>
            </div>
        </div>
    )
}