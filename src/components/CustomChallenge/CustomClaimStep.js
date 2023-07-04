import { constans } from "@/utils/constans";
import { Button, Input, message, Modal, Steps, Tooltip } from "antd";
import {
    UploadOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import CustomClaim from "./CustomClaim";
import CustomConnect from "./CustomConnect";
import CustomDiscord from "./CustomDiscord";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetScorePercent } from "@/utils/GetPercent";
import { submitClaimTweet } from "@/request/api/public";
import { ClaimShareSuccess } from "../CustomMessage";
import MyContext from "@/provider/context";
import { useNavigate } from "react-router-dom";
import { modalNotice } from "@/utils/modalNotice";



export default function CustomClaimStep(props) {
    
    const { 
        detail, 
        step, 
        changeStep, 
        tokenId, 
        answers, 
        showInner, 
        isClaim, 
        isShow,
        verify,
        answerInfo
    } = props;
    const { openseaLink, defaultImg, ipfsPath } = constans(); 
    const { t } = useTranslation(["claim", "translation"]);
    const { isMobile } = useContext(MyContext);
    const navigateTo = useNavigate();

    let [hrefUrl, setHrefUrl] = useState();
    let [isLoading, setIsLoading] = useState();
    let [cacheAnswers, setCacheAnswers] = useState();

    function changeHrefUrl(e) {
        hrefUrl = e;
        setHrefUrl(hrefUrl);
    }

    async function hrefSubmit() {
        let hasHash = true;
        await verify()
        .catch(() => {
            hasHash = false;
        })
        if (!hasHash) {
            return
        }

        const pattern = /^https:\/\/twitter\.com\/.*/i;
        if (!pattern.test(hrefUrl)) {
            message.warning(t("message.link"))
            return
        }
        setIsLoading(true);
        let score = GetScorePercent(answerInfo.totalScore, answerInfo.score);
        submitClaimTweet({
            uri: cacheAnswers.realAnswer[tokenId],
            tokenId: Number(tokenId),
            tweetUrl: hrefUrl,
            score: score,
            answer: JSON.stringify(answers)
        })
        .then(res => {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
            if (res.message.indexOf("Question Updated") !== -1 || res.message.indexOf("题目已更新") !== -1 ) {
                Modal.warning({
                    ...modalNotice({
                        t, onOk: () => {navigateTo(0)}
                    }
                )});
                return
            }
            if (res) {
                ClaimShareSuccess({isMobile: isMobile});
            }
        })
    }

    const tip = (
        <div className="tip-content">
            <p className="step">{t("tip.step",{num: 0})}</p>
            <p>{t("tip.step1")}</p>
            <p className="step">{t("tip.step",{num: 1})}</p>
            <p>
                {t("tip.step2.p1")}
                <span><UploadOutlined /></span>
                {t("tip.step2.p2")}
            </p>
            <p className="step">{t("tip.step",{num: 2})}</p>
            <p>{t("tip.step3")}</p>
        </div>
    )

    useEffect(() => {
        const cache = localStorage.getItem("decert.cache");
        cacheAnswers = JSON.parse(cache);
        setCacheAnswers({...cacheAnswers});
        const steps = document.querySelectorAll(".ant-steps-item-tail");
        for (let i = 0; i < steps.length-1; i++) {
            const dots = [
                document.createElement("div"),
                document.createElement("div"),
                document.createElement("div"),
                document.createElement("div"),
                document.createElement("div")
            ];
              dots.forEach(dot => {
                dot.classList = "custom-dot";
            });
            steps[i].append(...dots)
        }
    },[])

    return (
        <div className="content-step">
            <div className="nft">
                    <div className="img">
                        <img 
                            className="sbt"
                            src={
                                detail.metadata.image.split("//")[1]
                                    ? `${ipfsPath}/${detail.metadata.image.split("//")[1]}`
                                    : defaultImg
                            }
                            alt="" 
                        />
                        <a href={`${openseaLink}/${detail.tokenId}`} className="icon" target="_blank">
                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                        </a>
                    </div>
            </div>
            <div className="step">
                <h5>{t("step.title")}</h5>
                <Steps
                    className="step-detail"
                    progressDot
                    current={step}
                    direction="vertical"
                    items={[
                        {
                            description: (
                                <CustomConnect
                                    step={step}
                                    setStep={changeStep}
                                    isMobile={isMobile}
                                />
                            )
                        },
                        {
                            description: (
                                <CustomDiscord
                                    step={step}
                                    setStep={changeStep}
                                />
                            )
                        },
                        {
                            description: (
                                <CustomClaim
                                    step={step}
                                    setStep={changeStep}
                                    cliamObj={{
                                        uri: cacheAnswers?.realAnswer[tokenId],
                                        tokenId: Number(tokenId),
                                        score: answerInfo.score,
                                        answer: JSON.stringify(answers),
                                        totalScore: answerInfo.totalScore
                                    }}
                                    img={detail.metadata.image}
                                    showInner={showInner}
                                    isClaim={isClaim}
                                    isMobile={isMobile}
                                />
                            )
                        }
                    ]}
                />
                {
                    isShow && 
                    <div className="position">
                        <div className="innerHref step-box">
                            <Input
                                placeholder="https://twitter.com/account/access" 
                                onChange={e => changeHrefUrl(e.target.value)} 
                            />
                            <Button 
                                loading={isLoading} 
                                type="link" 
                                onClick={() => hrefSubmit()} 
                                disabled={!hrefUrl} 
                            >
                                {t("translation:btn-submit")}
                            </Button>
                        </div>
                        <Tooltip
                            overlayInnerStyle={{
                                borderRadius: isMobile ? "8px": "25px"
                                
                            }} 
                            placement="topRight" 
                            title={tip} 
                            overlayClassName={isMobile ? "tooltip-m" : "tooltip"}
                            color={isMobile ? "#FFF" : "#D8D8D8"} 
                        >
                            <QuestionCircleOutlined className="tips" />
                        </Tooltip>
                    </div>
                }
            </div>
        </div>
    )
}