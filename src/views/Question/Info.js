import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Rate } from "antd";
import { getUser } from "@/request/api/public";
import { avatar, nickname } from "@/utils/user";
import CustomViewer from "@/components/CustomViewer";
import { convertTime } from "@/utils/convert";

export default function Info(props) {
    
    const { detail } = props;
    const { t } = useTranslation(["explore","translation","publish"]);
    const navigateTo = useNavigate();
    let [user, setuser] = useState();

    function goChallenge() {
        navigateTo(`/challenge/${detail.tokenId}`)
    }

    function userInit() {
        getUser({address: detail.creator})
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
            <ul className="info-top">
                <li>
                    <p className="title mt13">{t("explore:creator")}</p>
                    <div className="info-content">
                        <Link to={{pathname: `/user/${user.address}`, search: "to=created"}}>
                            <div className="img">
                                <img src={avatar(user)} alt="" />
                            </div>
                        </Link>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <p className="name">{nickname(user)}</p>
                    </div>
                </li>
                <li>
                    <p className="title">{t("publish:inner.desc")}</p>
                    <div className="info-content desc">
                        {/* <p className="desc">{detail.metadata.description}</p> */}
                        {
                            detail.metadata.description &&
                            <CustomViewer label={detail.metadata.description} />
                        }
                    </div>
                </li>
                <li>
                    <p className="title">{t("explore:reward")}</p>
                    <div className="info-content">
                        <p className="reward">SBT</p>
                    </div>
                </li>
                <li>
                    <p className="title">{t("translation:diff")}</p>
                    <div className="info-content">
                        {
                            detail.metadata.properties?.difficulty !== null &&
                            <Rate disabled defaultValue={detail.metadata.properties.difficulty + 1} count={3} />
                        }
                    </div>
                </li>
                <li>
                    <p className="title">{t("translation:time")}</p>
                    <div className="info-content">
                        <p className="time">

                        {
                            detail.metadata.properties.estimateTime &&
                            t(`translation:time-info.${convertTime(detail.metadata.properties.estimateTime).type}`,{time:convertTime(detail.metadata.properties.estimateTime).time})
                        }
                        </p>
                    </div>
                </li>
                {
                    detail.recommend &&
                    <li>
                        <p className="title">{t("translation:header.lesson")}</p>
                        <div className="recommend desc custom-scroll">
                            <CustomViewer label={detail.recommend} />
                        </div>
                    </li>
                }
            </ul>
            <ul className="info-bottom">
                <div className="submit-bg">
                    <Button className="submit" onClick={() => goChallenge()}>
                        {t("btn-start")}
                    </Button>
                </div>
            </ul>
        </div>
    )
}