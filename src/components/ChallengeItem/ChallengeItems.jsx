import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";
import { useQuery } from "@tanstack/react-query";
import { getCollection } from "@/state/explore/challenge";
import { constans } from "@/utils/constans";
import ChallengeItemStatus from "./ChallengeItemStatus";
import ChallengeItemImg from "./ChallengeItemImg";
import { convertTime } from "@/utils/convert";

export default function ChallengeItems({ info, goCollection }) {
    const { data } = useQuery({
        queryKey: ["collection"],
        queryFn: () => getCollection(Number(info.id)),
    });

    const { ipfsPath, imgPath } = constans();
    const { t } = useTranslation(["profile", "explore"]);
    let [timestamp, setTimeStamp] = useState();
    let [collectionInfo, setCollectionInfo] = useState({
        questNum: 0,
        claimable: false,
        claimed: false,
    });

    function getTimeDiff(time) {
        const { type, time: num } = convertTime(time, "all")
        return t(`translation:${type}`, {time: Math.round(num)})
    }

    async function init() {
        try {
            let tokenId = data.collection.tokenId;
            collectionInfo.questNum = data.list.length;
            timestamp = info.quest_data?.estimateTime
                ? getTimeDiff(info?.estimateTime)
                : null;
            setTimeStamp(timestamp);
            if (tokenId && tokenId !== "0") {
                collectionInfo.claimable = !list.some((e) => !e.claimed);
                collectionInfo.claimed = data.status;
            }
            setCollectionInfo({ ...collectionInfo });
        } catch (error) {
            console.log(error);
        }
    }

    useUpdateEffect(() => {
        data && init();
    }, [data]);

    return (
        <div className="ChallengeItem" onClick={() => goCollection(info.id)}>
            {/* 挑战状态 */}
            <ChallengeItemStatus
                claimable={
                    collectionInfo.claimable && collectionInfo.questNum !== 0
                }
                claimed={
                    collectionInfo.claimed && collectionInfo.questNum !== 0
                }
            />
            <ChallengeItemImg
                img={`${ipfsPath}/${info.cover}`}
                questNum={collectionInfo.questNum}
            />
            <div className="left-info">
                <div>
                    <p className="title newline-omitted">{info.title}</p>
                    <p className="desc newline-omitted">{info.description}</p>
                </div>
                <div className="collection-author">
                    {info.author_info.avatar && (
                        <div className="img">
                            <img
                                src={imgPath + info.author_info.avatar}
                                alt=""
                            />
                        </div>
                    )}
                    <p>{info.author_info.nickname}</p>
                </div>
                <div className="sbt-detail">
                    <div className="flex">
                        {info?.difficulty !== null && (
                            <>
                                <span>{t("translation:diff")}</span>
                                <div className="imgs">
                                    {new Array(3).fill(0).map((e, i) => (
                                        <img
                                            key={i}
                                            alt=""
                                            src={require(`@/assets/images/icon/star-${
                                                i >= info?.difficulty + 1
                                                    ? "line"
                                                    : "full"
                                            }.png`)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="time">
                        {info?.estimate_time !== null && (
                            <>
                                <ClockCircleFilled />
                                {timestamp}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
