import { formatTimeToStrYMD } from "@/utils/date";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "@/assets/styles/component-style/index"
import { useNavigate } from "react-router-dom";
import { constans } from "@/utils/constans";
import { useTranslation } from "react-i18next";

export default function ChallengeItem(props) {
    
    const { info, isMe } = props;
    const { t } = useTranslation(["profile"]);
    const navigateTo = useNavigate();
    const { ipfsPath, defaultImg, openseaLink } = constans();

    const toQuest = () => {
        if (isMe && info.complete_ts) {
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

    return (
        <div className="ChallengeItem" onClick={toQuest}>
            {
                info.complete_ts && !info.claimed && isMe &&
                <div className="tags">
                    {t("claimble")}
                </div>
            }
            <div className="img">
                <LazyLoadImage
                    src={
                        info.metadata.image.split("//")[1]
                            ? `${ipfsPath}/${info.metadata.image.split("//")[1]}`
                            : defaultImg
                    }
                />
            </div>
            <div className="content">
                <p className="title">
                    {info.title}
                </p>
                <div className="flex">
                    <div className="icon img" onClick={toOpensea}>
                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                    </div>
                    <div className="date">
                        <div className="icon img">
                            <img src={require("@/assets/images/icon/yes.png")} alt="" />
                        </div>
                        {formatTimeToStrYMD(info.complete_ts ? info.complete_ts : info.addTs)}
                    </div>
                </div>
            </div>
        </div>
    )
}