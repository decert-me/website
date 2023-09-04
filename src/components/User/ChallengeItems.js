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


export default function ChallengeItems({info, goCollection}) {
    

    const navigateTo = useNavigate();
    const { ipfsPath } = constans();
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

    function init(params) {
        // 获取本地缓存已完成的
        let local = localStorage.getItem("decert.cache");
        if (local) {
            local = JSON.parse(local).claimable;
        }
        getCollectionQuest({id: Number(info.id)})
        .then(res => {
            if (res.status === 0) {
                const list = res.data.list || [];
                collectionInfo.questNum = list.length;
                collectionInfo.claimed = !list.some(e => !e.claimed);
                if (local && local.length !== 0) {
                    const commonElements = list.filter(element => local.some(ele => ele.token_id == element.tokenId));
                    collectionInfo.claimable = commonElements.length !== 0;
                }
                setCollectionInfo({...collectionInfo});
            }
        })
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
            <div className="right-sbt">
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