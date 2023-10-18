import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { getUser } from "@/request/api/public";
import { avatar, nickname } from "@/utils/user";
import CustomViewer from "@/components/CustomViewer";
import { convertTime } from "@/utils/convert";

export default function CollectionInfo(props) {
    
    const { detail } = props;
    const { t } = useTranslation(["explore","translation","publish"]);
    const navigateTo = useNavigate();
    let [user, setuser] = useState();
    const arr = [0, 1, 2];

    function startChallenge(id) {
        navigateTo(`/quests/${id}`)
    }

    function userInit() {
        getUser({address: detail.collection.author})
        .then(res => {
            user = res?.data;
            setuser({...user});
        })
    }

    useEffect(() => {
        detail && userInit()
    },[detail])

    return(
        user &&
        <div className="quest-info">
            <ul className="quest-info-top">
                <div className="quest-creator">
                    {/* <p className="title mt13">{t("explore:creator")}</p> */}
                    <div className="creator-info">
                        <Link to={{pathname: `/user/${user.address}`, search: "to=created"}}>
                            <div className="img avatar">
                                <img src={avatar(user)} alt="" />
                            </div>
                        </Link>
                        <p className="name">{nickname(user)}</p>
                    </div>
                    <Button className="btn-share">分享</Button>
                </div>
                <h1>{detail.collection.title}</h1>
                <li className="li">
                    <p className="title">{t("publish:inner.desc")}</p>
                    <div className="info-content desc overflow">
                        {
                            detail.collection.description &&
                            <CustomViewer label={detail.collection.description} />
                        }
                    </div>
                </li>
                <li className="li">
                    <p className="title">{t("explore:reward")}</p>
                    <div className="info-content">
                        <p className="reward">SBT</p>
                    </div>
                </li>
            </ul>
            <div className="challenges">
                {
                    detail.list.map((challenge, index) => (
                        <div className="challenge" key={index}>
                            <p className="challenge-title">{challenge.title}</p>
                            <p className="challenge-desc">{challenge.description}</p>
                            <div className="challenge-score">
                                <div className="score">
                                    {
                                        true && <p>分数：<span>98分</span></p>
                                    }
                                </div>
                                <Button className="btn-start" onClick={() => startChallenge(challenge.tokenId)}>开始挑战</Button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}