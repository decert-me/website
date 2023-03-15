import { formatTimeToStrYMD } from "@/utils/date";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "@/assets/styles/component-style/index"
import BadgeAddress from "@/contracts/Badge.address";
import { useNavigate } from "react-router-dom";

export default function ChallengeItem(props) {
    
    const { info, isMe } = props;
    const navigateTo = useNavigate();

    const toQuest = () => {
        navigateTo(`/quest/${info.tokenId}`)
    }

    const toOpensea = (event) => {
        event.stopPropagation();
        window.open(`https://testnets.opensea.io/assets/${process.env.REACT_APP_CHAIN_NAME}/${BadgeAddress}/${info.tokenId}`,'_blank')
    }

    return (
        <div className="ChallengeItem" onClick={toQuest}>
            {
                info.complete_ts && !info.claimed && isMe &&
                <div className="tags">
                    可领取
                </div>
            }
            <div className="img">
                <LazyLoadImage
                    src={
                        info.metadata.image.split("//")[1]
                            ? `http://ipfs.learnblockchain.cn/${info.metadata.image.split("//")[1]}`
                            : 'assets/images/img/default.png'
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