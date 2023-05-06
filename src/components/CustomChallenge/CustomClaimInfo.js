import { Button, Divider, Progress } from "antd"
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom"
import ModalViewRecommed from "../CustomModal/ModalViewRecommed";
import { useContext, useEffect, useMemo } from "react";
import MyContext from "@/provider/context";
import CustomViewer from "../CustomViewer";

export default function CustomClaimInfo(props) {
    
    const { answerInfo, percent, detail, isClaim } = props
    const { t } = useTranslation(["claim", "translation"]);
    const { isMobile } = useContext(MyContext);
    const navigateTo = useNavigate();

    function reChallenge(params) {
        navigateTo(`/quests/${detail.tokenId}`);
    }

    useEffect(() => {
        console.log(detail);
    },[])

    return (
        <>
            {
                <div className="content-info">
                    <div className="desc">
                        {
                            answerInfo.isPass || isClaim ? 
                                <p className="title">{t("pass")}  🎉🎉</p>
                            :
                                <p className="title">{t("unpass")}</p>
                        }
                    </div>
                    <div className="score">
                        <div className="circle">
                            <Progress
                                type="circle"
                                className={(answerInfo.isPass || isClaim) ? "pass" : "unpass"}
                                percent={percent}
                                width={isMobile ? 140 : 230}
                                format={(percent) => percent}
                                strokeWidth={3}
                            />
                        </div>
                        <div className="info">
                            <p className="network">{detail.title}</p>
                            <p className="pass">{t("score.passScore",{score: answerInfo.passingPercent})}</p>
                            {
                                !isMobile && 
                                <Button className="btn" onClick={reChallenge}>
                                    {t("translation:btn-go-challenge")}
                                </Button>
                            }
                        </div>
                    </div>
                    {
                        isMobile && 
                        <div className="mr">
                            <Button className="btn" onClick={reChallenge}>
                                {t("translation:btn-go-challenge")}
                            </Button>
                        </div>
                    }
                    {
                            !answerInfo.isPass && detail.recommend && !isClaim &&
                            <div className="viewer" >
                                <div className="viewer-head">
                                    <p>{t("recommend")}</p>
                                </div>
                                <Divider />
                                <div className="viewer-content">
                                    <CustomViewer label={detail.recommend} />
                                </div>
                            </div>
                    }
                </div>
            }
        </>
    )
}