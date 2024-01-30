import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { ClockCircleFilled, EditOutlined } from "@ant-design/icons";
import { constans } from "@/utils/constans";
import { convertTime } from "@/utils/convert";
import ChallengeItemStatus from "./ChallengeItemStatus";
import ChallengeItemImg from "./ChallengeItemImg";

/*
isMe: Boolean,
info: {
    tokenId: String,
    img: String,
    title: String,
    description: String,
    difficulty: Number,
    time: timestamp,
    claimable: Boolean,
    claimed: Boolean,
    editable: Boolean,
    has_claim: Boolean,
    review: Boolean,
}
claimedInfo: {
    hasNft: Boolean,
    hasVc: Boolean,
    info: {
        version,
        title,
        nft_address, 
        badge_chain_id, 
        badge_token_id, 
    }
}
*/

export default function ChallengeItem({ info, claimedInfo }) {
    const navigateTo = useNavigate();
    const { t } = useTranslation(["profile", "explore"]);
    const { ipfsPath, defaultImg, openseaLink, openseaSolanaLink } = constans();
    let [itemInfo, setItemInfo] = useState();

    function toQuest() {
        if (itemInfo?.claimable || itemInfo?.claimed || itemInfo?.review) {
            // 个人查看完成的挑战
            navigateTo(`/claim/${info.uuid}`);
        } else {
            navigateTo(`/quests/${info.uuid}`);
        }
    }

    function editChallenge(event) {
        event.stopPropagation();
        // 已有人claim，终止
        if (itemInfo?.has_claim) {
            message.warning(t("edit.error"));
            return;
        }
        window.open(`/publish?${itemInfo.tokenId}`, "_blank");
    }

    function getTimeDiff(time) {
        const { type, time: num } = convertTime(time, "all");
        return t(`translation:${type}`, { time: Math.round(num) });
    }

    function initInfo() {
        const img =
            info.metadata.image.indexOf("https://") !== -1
                ? info.metadata.image
                : info.metadata.image.split("//")[1]
                ? `${ipfsPath}/${info.metadata.image.split("//")[1]}`
                : info.metadata?.properties?.media.split("//")[1]
                ? `${ipfsPath}/${
                      info.metadata?.properties?.media.split("//")[1]
                  }`
                : defaultImg;

        itemInfo = {
            ...info,
            difficulty: info.metadata?.attributes?.difficulty,
            time: info.quest_data?.estimateTime
                ? getTimeDiff(info.quest_data?.estimateTime)
                : null,
            review: info?.open_quest_review_status === 1,
            img,
        };
        setItemInfo({ ...itemInfo });
    }

    useEffect(() => {
        initInfo();
    }, []);

    return (
        <div className="ChallengeItem" onClick={toQuest}>
            {/* 挑战状态 */}
            <ChallengeItemStatus
                claimable={itemInfo?.claimable}
                claimed={itemInfo?.claimed}
                review={itemInfo?.open_quest_review_status === 1}
            />
            {/* 编辑挑战 */}
            {itemInfo?.editable && (
                <div className="edit" onClick={editChallenge}>
                    <EditOutlined />
                </div>
            )}
            {/* 挑战Img */}
            <ChallengeItemImg img={itemInfo?.img} claimedInfo={claimedInfo} />
            {/* 挑战详情 */}
            <div className="left-info">
                <div>
                    <p className="title newline-omitted">{itemInfo?.title}</p>
                    <p className="desc newline-omitted">
                        {itemInfo?.description}
                    </p>
                </div>
                <div className="sbt-detail">
                    {itemInfo?.difficulty !== null && (
                        <div className="flex">
                            <span>{t("translation:diff")}</span>
                            <div className="imgs">
                                {new Array(3).fill(0).map((e, i) => (
                                    <img
                                        key={i}
                                        alt=""
                                        src={require(`@/assets/images/icon/star-${
                                            i >= itemInfo?.difficulty + 1
                                                ? "line"
                                                : "full"
                                        }.png`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {itemInfo?.time && (
                        <div className="time">
                            <ClockCircleFilled />
                            {itemInfo?.time}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
