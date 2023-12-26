import { getCollectionFlashRank, getCollectionHighRank, getCollectionHolderRank, getQuestFlashRank, getQuestHighRank, getQuestHolderRank } from "@/request/api/quests"
import { avatar, nickname } from "@/utils/user";
import { Segmented, Spin } from "antd";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Challenger(props) {
    
    const { questId, isCollection } = props;
    const navigateTo = useNavigate();
    const { t } = useTranslation(["explore"]);
    const [loading, setLoading] = useState(false);
    const [isOver, setIsOver] = useState(false);
    let [selectType, setSelectType] = useState("fast");
    let [detail, setDetail] = useState();
    let [rankList, setRankList] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 6
    });

    const options = [
        {
            label: "闪电榜",
            value: "fast"
        },
        {
            label: "高分榜",
            value: "score"
        },
        {
            label: "Holders",
            value: "holder"
        },
    ]

    const timestamp = (time) => {
        return time.replace("T"," ").split("+")[0].split(".")[0];
    }

    function changeSelect(type) {
        selectType = type;
        setSelectType(selectType);
        getList();
    }

    async function pendingHolder() {
        setLoading(true);
        pageConfig.page = pageConfig.page+1;
        setPageConfig({...pageConfig});
        if (isCollection) {
            await getCollectionHolderRank({questId, ...pageConfig})
            .then(res => {
                const list = res?.data?.list || [];
                rankList = rankList.concat(list);
                setRankList([...rankList]);
                if (list.length < pageConfig.pageSize || rankList.length === detail.total) {
                    setIsOver(true);
                }
            })
        }else{
            await getQuestHolderRank({questId, ...pageConfig})
            .then(res => {
                const list = res?.data?.list || [];
                rankList = rankList.concat(list);
                setRankList([...rankList]);
                if (list.length < pageConfig.pageSize || rankList.length === detail.total) {
                    setIsOver(true);
                }
            })
        }

        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }

    // 合集榜单数据
    async function collectionUpdate() {
        switch (selectType) {
            // 闪电榜
            case "fast":
                await getCollectionFlashRank({questId})
                .then(res => {
                    detail = res?.data;
                    setDetail({...detail});
                    rankList = res?.data?.RankList || [];
                    setRankList([...rankList]);
                })
                break;
            case "score":
                await getCollectionHighRank({questId})
                .then(res => {
                    detail = res?.data;
                    setDetail({...detail});
                    rankList = res?.data?.RankList || [];
                    setRankList([...rankList]);
                })
                break;
            case "holder":
                const {page, pageSize} = pageConfig;
                await getCollectionHolderRank({questId, page, pageSize})
                .then(res => {
                    detail = res?.data;
                    setDetail({...detail});
                    rankList = res?.data?.list || [];
                    setRankList([...rankList]);
                    if (rankList.length < pageConfig.pageSize || rankList.length === detail.total) {
                        setIsOver(true);
                    }
                })
                break;
            default:
                break;
        }
    }

    // 挑战榜单数据
    async function questUpdate() {
        switch (selectType) {
            // 闪电榜
            case "fast":
                await getQuestFlashRank({questId})
                .then(res => {
                    detail = res?.data;
                    setDetail({...detail});
                    rankList = res?.data?.RankList || [];
                    setRankList([...rankList]);
                })
                break;
            case "score":
                await getQuestHighRank({questId})
                .then(res => {
                    detail = res?.data;
                    setDetail({...detail});
                    rankList = res?.data?.RankList || [];
                    setRankList([...rankList]);
                })
                break;
            case "holder":
                const {page, pageSize} = pageConfig;
                await getQuestHolderRank({questId, page, pageSize})
                .then(res => {
                    detail = res?.data;
                    setDetail({...detail});
                    rankList = res?.data?.list || [];
                    setRankList([...rankList]);
                    if (rankList.length < pageConfig.pageSize || rankList.length === detail.total) {
                        setIsOver(true);
                    }
                })
                break;
            default:
                break;
        }
    }

    async function getList() {
        setLoading(true);
        if (isCollection) {
            await collectionUpdate();
        }else{
            await questUpdate();
        }
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }

    useEffect(() => {
        questId && getList();
    },[])

    return (
        <Spin spinning={loading}>
        <div className="quest-challenger">
            <Segmented rootClassName="selector" options={options} value={selectType}  onChange={(e) => changeSelect(e)} />
            <div className="label">
                <p className="label-title">
                    {selectType === "holder" ?
                        `Total ${detail?.total || ""}` : "Top 10"
                    }
                </p>
                <div className="label-type">
                    {selectType === "score" ?
                        "得分" : "完成时间"
                    }
                </div>
            </div>
            <div className="list">
                <ul>
                    {
                        rankList.map((e,i) => (
                            <li key={`${selectType}${e.address}`}>
                                <div className="info">
                                    {
                                        selectType !== "holder" &&
                                        <div className="no">
                                            {
                                                e.rank > 3 ? 
                                                e.rank :
                                                <img src={require(`@/assets/images/img/no${e.rank}.png`)} alt="" />
                                            }
                                        </div>
                                    }
                                    <div className="avatar" onClick={()=>navigateTo(`/${e.address}`)}>
                                        <img src={avatar(e)} width={30} height={30} alt="" />
                                    </div>
                                    <div className="addr" onClick={()=>navigateTo(`/${e.address}`)}>
                                        {nickname(e)}
                                    </div>
                                </div>
                                <div className="res">
                                    {
                                        selectType === "score" &&
                                        <div className="score">
                                            {e.score}分
                                        </div>
                                    }
                                    <div className={`time ${selectType === "score" ? "c9" : ""}`}>
                                        {timestamp(e.finish_time || e.claim_time)}
                                    </div>
                                </div>
                            </li>
                        ))
                    }
                    {
                        (selectType === "holder" && !isOver) ?
                        <div style={{margin: "0 auto", cursor: "pointer"}} onClick={pendingHolder}>
                            <img className="btn-more" src={require("@/assets/images/icon/more.png")} alt="" />
                        </div>
                        :
                        detail?.address ?
                        <li className="my-rank">
                            <div className="info">
                                <div className="no">
                                    {
                                        detail?.rank > 3 ? 
                                        detail?.rank :
                                        <img src={require(`@/assets/images/img/no${detail?.rank}.png`)} alt="" />
                                    }
                                </div>
                                <div className="avatar">
                                    <img src={avatar(detail)} width={30} height={30} alt="" />
                                </div>
                                <div className="addr">
                                    {nickname(detail)}
                                </div>
                            </div>
                            <div className="res">
                                {
                                    selectType === "score" &&
                                    <div className="score">
                                        {detail?.score}分
                                    </div>
                                }
                                <div className={`time ${selectType === "score" ? "c9" : ""}`}>
                                    {timestamp(detail.finish_time)}
                                </div>
                            </div>
                        </li>
                        :
                        ""
                    }
                </ul>
            </div>
        </div>
        </Spin>
    )
}