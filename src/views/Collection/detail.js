import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { getUser } from "@/request/api/public";
import { avatar, nickname } from "@/utils/user";
import CustomViewer from "@/components/CustomViewer";
import { convertTime } from "@/utils/convert";
import ChallengeItem from "@/components/User/ChallengeItem";

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
        <div className="collection-info">
            <ul className="collection-info-top">
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
                <h1 className="newline-omitted">{detail.collection.title}</h1>
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
                <li className="li">
                    <p className="title">{t("translation:diff")}</p>
                    <div className="info-content">
                        {
                            detail.collection?.difficulty !== null &&
                            arr.map((e,i) => {
                                if (i >= detail.collection.difficulty + 1) {
                                    return <img key={i} src={require("@/assets/images/icon/star-line.png")} alt="" />
                                }else{
                                    return <img key={i} src={require("@/assets/images/icon/star-full.png")} alt="" />
                                }
                            })
                        }
                    </div>
                </li>
            </ul>
            <div className="challenges">
                {
                    detail.list.map((challenge, index) => (
                        <ChallengeItem
                            key={challenge.id} 
                            info={challenge}
                        />
                    ))
                }
                
            </div>
        </div>
    )
}