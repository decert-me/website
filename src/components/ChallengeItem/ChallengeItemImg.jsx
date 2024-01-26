import { LazyLoadImage } from "react-lazy-load-image-component";
import ChallengeItemIcons from "./ChallengeItemIcons";



export default function ChallengeItemImg({img, claimedInfo}) {
    
    return (
        <div className="right-sbt challenge-img">
            <div className="img">
                <LazyLoadImage src={img} />
            </div>
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