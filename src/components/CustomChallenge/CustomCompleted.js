import { Button, Divider, Input, message, Progress, Steps, Tooltip } from "antd";
import {
    QuestionCircleOutlined,
    UploadOutlined,
    ExpandOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Encryption } from "@/utils/Encryption";
import CustomConnect from "./CustomConnect";
import CustomDiscord from "./CustomDiscord";
import CustomClaim from "./CustomClaim";
import { useAccount, useSigner } from "wagmi";
import { submitClaimTweet } from "@/request/api/public";
import { chainScores } from "@/controller";
import { GetPercent, GetScorePercent } from "@/utils/GetPercent";
import { ClaimShareSuccess } from "../CustomMessage";
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { Viewer } from "@bytemd/react";


export default function CustomCompleted(props) {
    
    const { answers, detail, tokenId, isClaim, plugins } = props;
    const { t } = useTranslation(["claim", "translation"]);
    const { verify } = useVerifyToken();
    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    const { openseaLink, defaultImg, ipfsPath } = constans(); 
    let [answerInfo, setAnswerInfo] = useState();
    let [step, setStep] = useState(0);
    let [isShow, setIsShow] = useState();
    let [hrefUrl, setHrefUrl] = useState();
    let [percent, setPercent] = useState(0);
    let [isLoading, setIsLoading] = useState();

    const tip = (
        <div className="tip-content">
            <p className="step">{t("tip.step",{num: 1})}</p>
            <p>{t("tip.step1")}</p>
            <p className="step">{t("tip.step",{num: 2})}</p>
            <p>
                {t("tip.step2.p1")}
                <span><UploadOutlined /></span>
                {t("tip.step2.p2")}
            </p>
            <p className="step">{t("tip.step",{num: 3})}</p>
            <p>{t("tip.step3")}</p>
        </div>
    )
    
    const contrast = async(arr) => {
        const questions = detail.metadata.properties.questions;
        let totalScore = 0;
        let score = 0;
        let successNum = 0;
        if (!isClaim) {
            // 未领取
            arr.map((e,i) => {
                totalScore += questions[i].score;
                if (typeof e === 'object') {
                    if (JSON.stringify(e) == JSON.stringify(answers[i])) {
                        score+=questions[i].score;
                        successNum+=1;
                    }
                }else{
                    console.log(' answers[i]', e , answers);
                    if (e == answers[i]) {
                        score+=questions[i].score;
                        successNum+=1;
                    }
                }
            })
            percent = GetPercent(totalScore, score);
            answerInfo = {
                totalScore: totalScore,
                score: score,
                passingScore: detail.metadata.properties.passingScore,
                passingPercent: GetPercent(totalScore, detail.metadata.properties.passingScore),
                isPass: score >= detail.metadata.properties.passingScore
            }
        }else{
            // 已领取
            questions.map(e => {
                totalScore += e.score;
            })
            await chainScores(address, tokenId, signer)
            .then(res => {
                percent = res / 100;
                answerInfo = {
                    totalScore: totalScore,
                    score: res / 100,
                    passingScore: detail.metadata.properties.passingScore,
                    passingPercent: GetPercent(totalScore, detail.metadata.properties.passingScore),
                    isPass: res / 100 >= detail.metadata.properties.passingScore
                }
            })
        }
        setAnswerInfo({...answerInfo});
        setPercent(percent);
        getStep();
    }

    const changeStep = (value) => {
        step = value;
        setStep(step);
    }

    const showInner = () => {
        setIsShow(true)
    }

    const changeHrefUrl = e => {
        hrefUrl = e;
        setHrefUrl(hrefUrl);
    }

    const hrefSubmit = async() => {

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
            tokenId: Number(tokenId),
            tweetUrl: hrefUrl,
            score: score,
            answer: JSON.stringify(answers)
        })
        .then(res => {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
            if (res) {
                ClaimShareSuccess();
            }
        })
    }

    const getStep = async() => {
        // const res = await verifyDiscord({address: address})
        // 判断当前步骤
        if (!answerInfo.isPass) {
            step = 0;
        }else if(isConnected === false || !localStorage.getItem('decert.token')){
            step = 1;
        }else if(isConnected === true){
            step = 2;
        }
        if (isClaim) {
            step = 3
        }
        // TODO: ===> 领取nft之前校验是否签名
        setStep(step);
    }

    const init = () => {
        const reAnswers = eval(decode(key, detail.metadata.properties.answers));
        contrast(reAnswers)
    }

    useEffect(() => {
        init()
    },[])

    return (
        <div className="CustomCompleted">
            {
                answerInfo &&
                 <div className="completed-content">
                    <div className="content-info">
                        <div className="desc">
                            {
                                answerInfo.isPass ? 
                                    <p className="title">{t("pass")}  🎉🎉</p>
                                :
                                    <p className="title">{t("unpass")}</p>
                            }
                            {
                                !answerInfo.isPass && detail.recommend ? 
                                <div className="viewer" >
                                    <div className="viewer-head">
                                        <p>推荐学习</p>
                                        <p><ExpandOutlined style={{ marginRight: "10px" }} />查看全文</p>
                                    </div>
                                    <Divider />
                                    <div className="viewer-content">
                                        <Viewer value={JSON.parse(detail.recommend)} plugins={plugins} />
                                    </div>
                                </div>
                                :
                                <p className="desc">{t("desc")}</p>
                            }
                        </div>
                        <div className="score">
                            <p className="network">{detail.title}</p>
                            <h4>{t("score.now")}</h4>
                            <p className="pass">{t("score.passScore",{score: answerInfo.passingPercent})}</p>
                            <div className="score-detail">
                                <div className="circle">
                                    <Progress
                                        type="circle"
                                        percent={percent}
                                        width={172}
                                        format={(percent) => percent}
                                        strokeWidth={6}
                                    />
                                </div>
                                <Link className="btn" to={`/quests/${detail.tokenId}`}>
                                    <button className="btn">{t("translation:btn-go-challenge")}</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="content-step">
                        <div className="nft">
                                <div className="img">
                                    <a href={`${openseaLink}/${detail.tokenId}`} target="_blank">
                                        <img 
                                            src={
                                                detail.metadata.image.split("//")[1]
                                                    ? `${ipfsPath}/${detail.metadata.image.split("//")[1]}`
                                                    : defaultImg
                                            }
                                            alt="" 
                                        />
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
                                            <div className={`step-box ${step === 0 ? "checked-step" : ''}`}>
                                                {
                                                    answerInfo.isPass ?
                                                    t("step.pass")
                                                    :
                                                    t("step.unpass")
                                                }
                                            </div>
                                        )
                                    },
                                    {
                                        description: (
                                            <CustomConnect 
                                                step={step}
                                                setStep={changeStep}
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
                                                    tokenId: Number(tokenId),
                                                    score: answerInfo.score,
                                                    answer: JSON.stringify(answers),
                                                    totalScore: answerInfo.totalScore
                                                }}
                                                img={detail.metadata.image}
                                                showInner={showInner}
                                                isClaim={isClaim}
                                            />
                                        )
                                    }
                                ]}
                            />
                            {
                                isShow && 
                                <div className="position">
                                    <div className="innerHref step-box">
                                        <Input placeholder="https://twitter.com/account/access" onChange={e => changeHrefUrl(e.target.value)} />
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
                                            width: "290px", 
                                            borderRadius: "25px"
                                        }} 
                                        placement="topRight" 
                                        title={tip} 
                                        color="#D8D8D8" 
                                    >
                                        <QuestionCircleOutlined className="tips" />
                                    </Tooltip>
                                </div>
                            }
                        </div>
                    </div>
                 </div>
            }
        </div>
    )
}