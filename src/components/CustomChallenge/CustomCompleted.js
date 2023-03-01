import { Steps } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Encryption } from "@/utils/Encryption";
import ArcProgress from 'react-arc-progress';
import CustomConnect from "./CustomConnect";
import CustomDiscord from "./CustomDiscord";
import { useAccount } from "wagmi";
import { verifyDiscord } from "../../request/api/public";
import CustomClaim from "./CustomClaim";

export default function CustomCompleted(props) {
    
    const { answers, detail, tokenId } = props;
    const { address, isConnected } = useAccount();
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    let [answerInfo, setAnswerInfo] = useState();
    let [progrees, setProgrees] = useState();
    let [step, setStep] = useState(0);

    const contrast = (arr) => {
        const questions = detail.metadata.properties.questions;
        let totalScore = 0;
        let score = 0;
        let successNum = 0;
        arr.map((e,i) => {
            totalScore += questions[i].score;
            if (typeof e === 'object') {
                if (JSON.stringify(e) == JSON.stringify(answers[i])) {
                    score+=questions[i].score;
                    successNum+=1;
                }
            }else{
                if (e == answers[i]) {
                    score+=questions[i].score;
                    successNum+=1;
                }
            }
        })
        answerInfo = {
            totalScore: totalScore,
            score: score,
            passingScore: detail.metadata.properties.passingScore,
            isPass: score >= detail.metadata.properties.passingScore
        }
        setAnswerInfo({...answerInfo});
        // 初始化进度条
        progrees = {
            progress: (1 / arr.length) * successNum,
            size: 172,
            arcStart: -90,
            arcEnd: 270,
            fillThickness: 8,
            thickness: 3,
            emptyColor: '#e8e8e8',
            fillColor: '#9bf899',
            animation: 1000,
        }
        setProgrees({...progrees});
        getStep();
        console.log('answerInfo ==>', answerInfo);
        console.log("detail ==>", detail);
    }

    const changeStep = (value) => {
        step = value;
        setStep(step);
    }

    const getStep = async() => {
        const res = await verifyDiscord({address: address})
        // 判断当前步骤
        if (!answerInfo.isPass) {
            step = 0;
        }else if(isConnected === false){
            step = 1;
        }else if (res?.status !== 0) {
            step = 2;
        }else{
            step = 3;
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
                        {
                            answerInfo.isPass ? 
                            <div className="desc">
                                <p className="title">恭喜你完成挑战  🎉🎉</p>
                                <p>你已通过技术认证，灵魂绑定后，SBT将不可转移或转送于他人，它将成为你技术认证的证明，为你的履历添砖加瓦。</p>
                            </div>
                            :
                            <div className="desc">
                                <p className="title">Challenge not passed, please keep going</p>
                                <p>通过挑战后，你将获得SBT徽章并与它灵魂绑定，它将成为你技术认证的证明，为你的履历添砖加瓦。</p>
                            </div>
                        }
                        <div className="score">
                            <p className="network">{detail.title}</p>
                            <h4>本次得分</h4>
                            <p className="pass">达到 {answerInfo.passingScore} 即可挑战通关</p>
                            <div className="score-detail">
                                <div className="circle">
                                    <ArcProgress
                                        className="progress-container2"
                                        {...progrees}
                                    />
                                    <p className="text">{answerInfo.score}</p>
                                </div>
                                <Link className="btn" to={`/question/${detail.tokenId}`}>
                                    <button className="btn">查看挑战详情</button>
                                    
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="content-step">
                        <div className="nft">
                            {/* <h5>NFT证书展示</h5> */}
                                <div className="img">
                                    <a href="#" target="_blank">
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
                            <h5>领取SBT 证书</h5>
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
                                                    answer: JSON.stringify(answers)
                                                }}
                                                img={detail.metadata.image}
                                            />
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </div>
                 </div>
            }
        </div>
    )
}