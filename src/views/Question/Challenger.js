import { getChallengers } from "@/request/api/quests"
import { avatar } from "@/utils/user";
import { Segmented } from "antd";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Challenger(props) {
    
    const { questId } = props;
    const { t } = useTranslation(["explore"]);
    const [selectType, setSelectType] = useState("fast");
    let [detail, setDetail] = useState();

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

    const mock = {
        avatar: "https://ipfs.decert.me/bafybeicd2u6h5uozel22ykklrw4dwh5nk2pyladngst4kjtrwijeihmto4", addr: "0xFB...6CA28", time: "2023-12-12 10:30", score: "90"
    }

    const mockData =[
        
    ]

    function changeSelect(type) {
        setSelectType(type);
    }

    async function init(params) {
        getChallengers({questId: questId})
        .then(res => {
            detail = res?.data;
            setDetail(detail);
        })
    }

    useEffect(() => {
        questId && init();
    },[])

    return (
        detail &&
        <div className="quest-challenger">
            <Segmented rootClassName="selector" options={options} value={selectType}  onChange={(e) => changeSelect(e)} />
            {/* <div className="title">
                {t("challenger")}
                <span>{detail.Times}</span>
            </div> */}
            <div className="label">
                <p className="label-title">
                    {selectType === "holder" ?
                        `Total ${detail.Times}` : "Top 10"
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
                    {/* {
                        detail.users.map((e,i) => 
                            <li key={i}>
                                <Link to={`/${e.address}`}>
                                    <img src={avatar(e)} alt="" />
                                </Link>
                            </li>
                        )
                    } */}
                    {
                        Array.from({length: 10}).map((e,i) => (
                            <li key={i}>
                                <div className="info">
                                    <div className="no">
                                        {
                                            i > 2 ? 
                                            i + 1 :
                                            <img src={require(`@/assets/images/img/no${i+1}.png`)} alt="" />
                                        }
                                    </div>
                                    <div className="avatar">
                                        <img src={mock.avatar} width={30} height={30} alt="" />
                                    </div>
                                    <div className="addr">
                                        {mock.addr}
                                    </div>
                                </div>
                                <div className="res">
                                    {
                                        selectType === "score" &&
                                        <div className="score">
                                            {mock.score}分
                                        </div>
                                    }
                                    <div className={`time ${selectType === "score" ? "c9" : ""}`}>
                                        {mock.time}
                                    </div>
                                </div>
                            </li>
                        ))
                    }
                    {
                        selectType === "holder" ?
                        <div style={{margin: "0 auto", cursor: "pointer"}}>
                            <img className="btn-more" src={require("@/assets/images/icon/more.png")} alt="" />
                        </div>
                        :
                        <li className="my-rank">
                            <div className="info">
                                <div className="no">
                                    190
                                </div>
                                <div className="avatar">
                                    <img src={mock.avatar} width={30} height={30} alt="" />
                                </div>
                                <div className="addr">
                                    {mock.addr}
                                </div>
                            </div>
                            <div className="res">
                                {
                                    selectType === "score" &&
                                    <div className="score">
                                        {mock.score}分
                                    </div>
                                }
                                <div className={`time ${selectType === "score" ? "c9" : ""}`}>
                                    {mock.time}
                                </div>
                            </div>
                        </li>
                    }
                </ul>
            </div>
        </div>
    )
}