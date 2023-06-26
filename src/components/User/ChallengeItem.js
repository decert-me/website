import { ClockCircleFilled } from '@ant-design/icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "@/assets/styles/component-style/index"
import "@/assets/styles/mobile/component-style/user/challengeItem.scss"
import { useNavigate } from "react-router-dom";
import { constans } from "@/utils/constans";
import { useTranslation } from "react-i18next";
import { convertTime } from "@/utils/convert";
import MyContext from '@/provider/context';
import { useContext } from 'react';

export default function ChallengeItem(props) {
    
    const { info, profile } = props;
    const { isMobile } = useContext(MyContext);
    const { t } = useTranslation(["profile", "explore"]);
    const navigateTo = useNavigate();
    // const { ipfsPath, defaultImg, openseaLink } = constans(checkType === 1 ? true : false);
    const { ipfsPath, defaultImg, openseaLink } = constans(profile?.checkType);
    const arr = [0, 1, 2];


    const toQuest = () => {
        // if (profile?.isMe && info.complete_ts) {
        if (info?.claimable || info?.claimed) {
            // 个人查看完成的挑战
            navigateTo(`/claim/${info.tokenId}`)
        }else{
            navigateTo(`/quests/${info.tokenId}`)
        }
    }

    const toOpensea = (event) => {
        event.stopPropagation();
        window.open(`${openseaLink}/${info.tokenId}`,'_blank')
    }

    function clickSbt(event) {
        if (isMobile) {
            event.stopPropagation();
            window.open(`${openseaLink}/${info.tokenId}`,'_blank')
        }
    }

    function getTimeDiff(time) {
        var timeDiff;
        // if (typeof time === "number") {
        //     var now = Math.round(new Date().getTime() / 1000);
        //     timeDiff = now - time;
        // }else{
        //     var now = new Date();
        //     var dbTime = new Date(time);
        //     timeDiff = Math.round(now - dbTime) / 1000;
        // }
        const { type, time: num } = convertTime(time, "all")

        return (
            <>
                {t(`translation:${type}`, {time: Math.round(num)})}
            </>
        )
    }

    function Rate(num) {
        const arr = [0, 1, 2];
        arr.map((e,i) => {
            if (i >= num) {
                return <img src={require("@/assets/images/icon/star-full.png")} alt="" />
            }else{
                return <img src={require("@/assets/images/icon/star-line.png")} alt="" />
            }
        })
    }

    return (
        <div className="ChallengeItem" onClick={toQuest}>
            {
                (!profile && info.claimable) || (profile && profile.isMe && info.complete_ts && !info.claimed) ?
                <div className="item-claimable">
                    {t("claimble")}
                </div>
                :<></>
            }
            {
                info.claimed && 
                <div className="item-claimed">
                    {t("explore:pass")}
                </div>
            }
            <div className="right-sbt" onClick={clickSbt}>
                <div className="img">
                        <LazyLoadImage
                            src={
                                info.metadata.image.split("//")[1]
                                ? `${ipfsPath}/${info.metadata.image.split("//")[1]}`
                                : defaultImg
                            }
                        />
                </div>
                {
                    profile && 
                    <div className={`opensea img ${isMobile ? "show" : ""}`} onClick={toOpensea}>
                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                    </div>
                }
            </div>
            <div className="left-info">
                <div>
                    <p className="title newline-omitted">
                        {info.title}
                    </p>
                    <p className="desc newline-omitted">
                        {info.metadata.description}
                    </p>
                </div>
                <div className="sbt-detail">
                    <div className='flex'>
                        {
                            info.metadata?.attributes?.difficulty !== null && 
                            <>
                            <span>{t("translation:diff")}</span>
                            <div className="imgs">
                                {
                                    arr.map((e,i) => {
                                        if (i >= info.metadata?.attributes?.difficulty+1) {
                                            return <img src={require("@/assets/images/icon/star-line.png")} alt="" />
                                        }else{
                                            return <img src={require("@/assets/images/icon/star-full.png")} alt="" />
                                        }
                                    })
                                }
                            </div>
                            </>
                        }
                    </div>
                    <div className="time">
                        {
                            info.quest_data?.estimateTime !== null && 
                            <>
                                <ClockCircleFilled />
                                {getTimeDiff(info.quest_data?.estimateTime)}
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