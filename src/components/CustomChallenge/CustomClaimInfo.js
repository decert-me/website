import { Button, Divider, Progress } from "antd"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { useContext } from "react";
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
                                width={isMobile ? 126 : 208}
                                strokeColor={
                                    answerInfo.isPass ? 
                                    {
                                        '0%': '#5AD68D',
                                        '100%': '#43B472',
                                    }
                                    :
                                    {
                                        '0%': '#F46565',
                                        '100%': '#B64444',
                                    }
                                }
                                format={(percent) => (
                                    <>
                                        {percent}
                                        <p className="text">{t("score.now")}</p>
                                    </>
                                )}
                                strokeWidth={10}
                            />
                        </div>
                        <div className="info">
                            <p className="network newline-omitted">{detail.title}</p>
                            <p className="pass">{t("score.passScore",{score: answerInfo.passingPercent})}</p>
                            {
                                !isMobile && 
                                <Button className="btn" id="hover-btn-line" onClick={reChallenge}>
                                    {t("translation:btn-go-challenge")}
                                </Button>
                            }
                        </div>
                    </div>
                    {
                        isMobile && 
                        <div className="mr">
                            <Button className="btn" id="hover-btn-line" onClick={reChallenge}>
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