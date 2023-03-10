import { Button, Input, message, Progress, Steps, Tooltip } from "antd";
import {
    QuestionCircleOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Encryption } from "@/utils/Encryption";
import CustomConnect from "./CustomConnect";
import CustomDiscord from "./CustomDiscord";
import { useAccount, useSigner } from "wagmi";
import { submitClaimTweet } from "@/request/api/public";
import CustomClaim from "./CustomClaim";
import BadgeAddress from "@/contracts/Badge.address";
import { chainScores } from "@/controller";
import { GetPercent, GetScorePercent } from "@/utils/GetPercent";
import { ClaimShareSuccess } from "../CustomMessage";

const tip = (
    <div className="tip-content">
        <p className="step">第 1 步：</p>
        <p>导航到你要想得到其 URL 的推文。</p>
        <p className="step">第 2 步：</p>
        <p>点击推文中的 <span><UploadOutlined /></span> 图标。</p>
        <p className="step">第 3 步：</p>
        <p>在弹出式菜单中，选择复制推文链接。URL 现在应该已复制到剪贴板。</p>
    </div>
)
export default function CustomCompleted(props) {
    
    const { answers, detail, tokenId, isClaim } = props;
    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    let [answerInfo, setAnswerInfo] = useState();
    let [step, setStep] = useState(0);
    let [isShow, setIsShow] = useState();
    let [hrefUrl, setHrefUrl] = useState();
    let [percent, setPercent] = useState(0);
    let [isLoading, setIsLoading] = useState();
    
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

    const hrefSubmit = () => {
        const pattern = /^https:\/\/twitter\.com\/.*/i;
        if (!pattern.test(hrefUrl)) {
            message.warning('请填写正确的链接')
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
                                    <p className="title">恭喜你完成挑战  🎉🎉</p>
                                :
                                    <p className="title">挑战未通过，请继续加油吧。</p>
                            }
                            <p>通过挑战后，你将获得SBT徽章并与它灵魂绑定，它将成为你技术认证的证明，为你的履历添砖加瓦。</p>
                        </div>
                        <div className="score">
                            <p className="network">{detail.title}</p>
                            <h4>本次得分</h4>
                            <p className="pass">达到 {answerInfo.passingPercent} 即可挑战通关</p>
                            <div className="score-detail">
                                <div className="circle">
                                    {/* <ArcProgress
                                        className="progress-container2"
                                        {...progrees}
                                    /> */}
                                    <Progress
                                        type="circle"
                                        percent={percent}
                                        width={172}
                                        format={(percent) => percent}
                                        strokeWidth={6}
                                    />
                                    {/* <p className="text">{answerInfo.score}</p> */}
                                </div>
                                <Link className="btn" to={`/quests/${detail.tokenId}`}>
                                    <button className="btn">查看挑战详情</button>
                                    
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="content-step">
                        <div className="nft">
                            {/* <h5>NFT证书展示</h5> */}
                                <div className="img">
                                    <a href={`https://testnets.opensea.io/assets/${process.env.REACT_APP_CHAIN_NAME}/${BadgeAddress}/${detail.tokenId}`} target="_blank">
                                        <img 
                                            src={
                                                detail.metadata.image.split("//")[1]
                                                    ? `http://ipfs.learnblockchain.cn/${detail.metadata.image.split("//")[1]}`
                                                    : 'assets/images/img/default.png'
                                            }
                                            alt="" 
                                        />
                                        {/* <div className="icon" /> */}
                                    </a>
                                </div>
                        </div>
                        <div className="step">
                            <h5>领取 SBT 证书</h5>
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
                                                    "已完成挑战"
                                                    :
                                                    "挑战失败"
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
                                            提交
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