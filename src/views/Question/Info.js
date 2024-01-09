import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { getUser } from "@/request/api/public";
import { avatar, nickname } from "@/utils/user";
import CustomViewer from "@/components/CustomViewer";
import { convertTime } from "@/utils/convert";

export default function Info(props) {
    
    const { detail } = props;
    const { t } = useTranslation(["explore","translation","publish"]);
    const navigateTo = useNavigate();
    let [user, setuser] = useState();
    const arr = [0, 1, 2];

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
                <li className="li">
                    <p className="title mt13">{t("explore:creator")}</p>
                    <div className="info-content">
                        <Link to={{pathname: `/user/${user.address}`, search: "to=created"}}>
                            <div className="img avatar">
                                <img src={avatar(user)} alt="" />
                            </div>
                        </Link>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <p className="name">{nickname(user)}</p>
                    </div>
                </li>
                <li className="li">
                    <p className="title">{t("publish:inner.desc")}</p>
                    <div className="info-content desc overflow">
                        {/* <p className="desc">{detail.metadata.description}</p> */}
                        {
                            detail.description &&
                            <CustomViewer label={detail.description} />
                        }
                    </div>
                </li>
                <li className="li">
                    <p className="title">{t("explore:reward")}</p>
                    <div className="info-content">
                        <div className="reward">
                            <div className="reward-item">NFT</div>
                            <div className="reward-item">Privacy Certification</div>
                        </div>
                    </div>
                </li>
                <li className="li">
                    <p className="title">{t("translation:diff")}</p>
                    <div className="info-content">
                        {
                            detail.metadata.properties?.difficulty !== null &&
                            arr.map((e,i) => {
                                if (i >= detail.metadata.properties.difficulty + 1) {
                                    return <img key={i} src={require("@/assets/images/icon/star-line.png")} alt="" />
                                }else{
                                    return <img key={i} src={require("@/assets/images/icon/star-full.png")} alt="" />
                                }
                            })
                        }
                    </div>
                </li>
                <li className="li">
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
                    <li className="li li-recommend">
                        <p className="title">{t("translation:header.lesson")}</p>
                        <div className="recommend desc custom-scroll">
                            <CustomViewer label={detail.recommend} />
                        </div>
                    </li>
                }
            </ul>
            {
                detail.status === 1 &&
                <ul className="info-bottom">
                    <div className="submit-bg">
                        <Button className="submit" id="hover-btn-full" onClick={() => goChallenge()}>
                            {t("btn-start")}
                        </Button>
                    </div>
                </ul>
            }
        </div>
    )
}