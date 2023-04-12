import { Button } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getQuests } from "../request/api/public";
import "@/assets/styles/view-style/question.scss"
import "@/assets/styles/mobile/view-style/question.scss"
import { hashAvatar } from "../utils/HashAvatar";
import { convertDifficulty, convertTime } from "../utils/convert";
import { NickName } from "../utils/NickName";
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";


export default function Quests(params) {
    
    const location = useLocation();
    const { t } = useTranslation(["explore","translation"]);
    const { ipfsPath, defaultImg } = constans();
    let [detail, setDetail] = useState();

    const getData = (id) => {
        getQuests({id: id})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
            console.log(detail);
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
                                    ? `${ipfsPath}/${detail.metadata.image.split("//")[1]}`
                                    : defaultImg
                            }
                            alt="" />
                    </div>
                    <div className="content">
                        <p className="desc">{detail.metadata.description}</p>
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
                        <Link to={`/user/${detail.creator}`}>
                            <li>
                                <div className="img">
                                    <img src={hashAvatar(detail.creator)} alt="" />
                                </div>
                                <p>{NickName(detail.creator)}</p>
                            </li>
                        </Link>
                            
                        {
                            detail.metadata.properties?.difficulty !== null &&
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
                    <div className="bottombar">
                        <Link to={`/challenge/${detail.tokenId}`} className="btn">
                            <Button>
                                {t("btn-start")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}