import { LazyLoadImage } from "react-lazy-load-image-component";
import ChallengeItemIcons from "./ChallengeItemIcons";

/*
info: {
    img,
    title,
    description,
    difficulty,
    time
}
hasNft: Boolean
hasVc: Boolean
*/

export default function ChallengeItem({
    info,
    hasNft,
    hasVc
}) {
    


    return (
        <div className="ChallengeItem">
            <div className="right-sbt challenge-img" onClick={clickSbt}>
                <div className="img">
                    <LazyLoadImage src={info.img || defaultImg}/>
                </div>
                <ChallengeItemIcons hasNft={hasNft} hasVc={hasVc} />
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
                            info.metadata?.attributes?.difficulty !== null && 
                            <>
                            <span>{t("translation:diff")}</span>
                            <div className="imgs">
                                {
                                    arr.map((e,i) => {
                                        if (i >= info.metadata?.attributes?.difficulty+1) {
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
                        <ClockCircleFilled />
                        {info?.time}
                    </div>
                </div>
            </div>
        </div>
    )
}