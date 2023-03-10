import { Button } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getQuests } from "../request/api/public";
import "@/assets/styles/view-style/question.scss"
import { hashAvatar } from "../utils/HashAvatar";
import { convertDifficulty, convertTime } from "../utils/convert";
import { NickName } from "../utils/NickName";
import { useTranslation } from "react-i18next";


export default function Quests(params) {
    
    const location = useLocation();
    const { t } = useTranslation(["explore","translation"]);
    let [detail, setDetail] = useState();

    const getData = (id) => {
        getQuests({id: id})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
        })
    }

    useEffect(() => {
        const id = location?.pathname?.split("/")[2];
        id && getData(id);
    }, []);

    return (
        detail &&
        <>
            <h1 className="quests-title">{detail.title}</h1>
            <div className="Question">
                <div className="question-content">
                    <div className="img">
                        <img 
                            src={
                                detail.metadata.image.split("//")[1]
                                    ? `http://ipfs.learnblockchain.cn/${detail.metadata.image.split("//")[1]}`
                                    : 'assets/images/img/default.png'
                            }
                            alt="" />
                    </div>
                    <div className="content">
                        <p className="desc">{detail.description}</p>
                        <div>
                            <h3>{t("ques.title")}</h3>
                            <p className="desc">
                            {t("ques.desc")}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="question-bottom">
                    <ul>
                        <li>
                            <div className="img">
                                <img src={hashAvatar(detail.creator)} alt="" />
                            </div>
                            <p>{NickName(detail.creator)}</p>
                        </li>
                            
                        {
                            detail.metadata.properties.difficulty !== null &&
                            <li>
                                {t("translation:diff")}: {t(`translation:diff-info.${convertDifficulty(detail.metadata.properties.difficulty)}`)}
                            </li>
                        }
                        {
                            detail.metadata.properties.estimateTime &&
                            <li>
                                {t("translation:time")}: {t(`translation:time-info.${convertTime(detail.metadata.properties.estimateTime).type}`,{time:convertTime(detail.metadata.properties.estimateTime).time})}
                            </li>
                        }
                    </ul>
                    <Link to={`/challenge/${detail.tokenId}`}>
                        <Button>
                            {t("btn-start")}
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    )
}