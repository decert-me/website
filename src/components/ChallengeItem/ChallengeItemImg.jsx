import { LazyLoadImage } from "react-lazy-load-image-component";
import ChallengeItemIcons from "./ChallengeItemIcons";



export default function ChallengeItemImg({img, claimedInfo, questNum}) {
    
    return (
        <div className="right-sbt challenge-img">
            <div className="img">
                <LazyLoadImage src={img} />
            </div>
            {/* 阴影文本: ERC-721展示 */}
            {
                claimedInfo?.info.version === "2" && !claimedInfo?.hasNft &&
                <div className="img-mask">
                    <p className="newline-omitted">{claimedInfo?.info.title}</p>
                </div>
            }
            {/* 挑战集合信息 */}
            {
                questNum &&
                <div className="sbt-bottom">
                    <div>
                        <img src={require("@/assets/images/icon/icon-collection.png")} alt="" />
                    </div>
                    <div>
                        <img src={require("@/assets/images/icon/icon-challenge.png")} alt="" />
                        <p>{questNum}</p>
                    </div>
                </div>
            }
            {
                claimedInfo &&
                <ChallengeItemIcons 
                    hasNft={claimedInfo?.hasNft} 
                    hasVc={claimedInfo?.hasVc}
                    info={claimedInfo?.info}
                />
            }
        </div>
    )
}