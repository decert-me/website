import { message, Spin } from "antd";
import {
    LoadingOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Encryption } from "@/utils/Encryption";
import { useAccount, useSigner } from "wagmi";
// import { chainScores } from "@/controller";
import { GetPercent } from "@/utils/GetPercent";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import CustomClaimInfo from "./CustomClaimInfo";
import CustomClaimStep from "./CustomClaimStep";
import { useBadgeContract } from "@/controller/contract";
import Confetti from "react-confetti";


export default function CustomCompleted(props) {
    
    const { answers, detail, tokenId, isClaim } = props;
    const { verify } = useVerifyToken();
    const { data: signer } = useSigner({
        chainId: Number(process.env.REACT_APP_CHAIN_ID)
    });
    const { address, isConnected } = useAccount();
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    
    let [answerInfo, setAnswerInfo] = useState();
    let [showConfetti, setShowConfetti] = useState(false);
    let [step, setStep] = useState(0);
    let [isShow, setIsShow] = useState();
    let [percent, setPercent] = useState(0);
    let [scoresArgs, setScoresArgs] = useState(address ? [Number(tokenId), address] : null);
    const { data, isLoading, refetch } = useBadgeContract({
        functionName: "scores",
        args: scoresArgs
    })

    const contrast = async(arr) => {
        const questions = detail.metadata.properties.questions;
        let totalScore = 0;
        let score = 0;
        let successNum = 0;
        if (!isClaim) {
            // 未领取
            arr.map((e,i) => {
                // 兼容原先版本localStorage ==> decert.cache格式
                totalScore += Number(questions[i].score);
                if (e === null) {
                    if (answers[i]?.correct) {
                        score+=Number(questions[i].score);
                        successNum+=1;
                    }
                }else if (typeof e === 'object') {
                    if (JSON.stringify(e) == JSON.stringify(answers[i]?.value) || JSON.stringify(e) == JSON.stringify(answers[i])) {
                        score+=questions[i].score;
                        successNum+=1;
                    }
                }else{
                    if (answers[i]?.value && e == answers[i].value) {
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
            // TODO: 添加 react-confetti
            if (answerInfo.isPass) {
                setShowConfetti(true);
                const cache = JSON.parse(localStorage.getItem("decert.cache"));
                const claimable = cache?.claimable ? cache.claimable : [];
                if (!claimable.includes(tokenId)) {
                    claimable.push(tokenId)
                }
                cache.claimable = claimable;
                localStorage.setItem("decert.cache", JSON.stringify(cache))
            }
        }else{
            // 已领取
            questions.map(e => {
                totalScore += e.score;
            })
            let res;
            await refetch()
            .then(result => {
                res = result.data?.toString();
            })
            percent = res / 100;
            answerInfo = {
                totalScore: totalScore,
                score: res / 100,
                passingScore: detail.metadata.properties.passingScore,
                passingPercent: GetPercent(totalScore, detail.metadata.properties.passingScore),
                isPass: detail.claimed
            }
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

    const getStep = async() => {
        // 判断当前步骤
        if(isConnected === false || !localStorage.getItem('decert.token')){
            step = 0;
        }else if(isConnected === true){
            step = 1;
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
    },[signer])

    return (
        <div className="CustomCompleted">
            {
                showConfetti && 
                <Confetti 
                    width={document.documentElement.clientWidth} 
                    height={document.documentElement.clientHeight} 
                    numberOfPieces={500}
                    recycle={false}
                />
            }
            {
                answerInfo ?
                 <div className="completed-content">
                    <CustomClaimInfo 
                        answerInfo={answerInfo}
                        percent={percent}
                        detail={detail}
                        isClaim={isClaim}
                    />
                    {
                        answerInfo.isPass && 
                        <CustomClaimStep
                            detail={detail}
                            step={step}
                            changeStep={changeStep}
                            tokenId={tokenId}
                            answers={answers}
                            showInner={showInner}
                            isClaim={isClaim}
                            isShow={isShow}
                            verify={verify}
                            answerInfo={answerInfo}
                        />
                    }
                 </div>
                 :
                 <div className="claim-loading">
                    <Spin 
                        indicator={
                            <LoadingOutlined
                                style={{
                                fontSize: "50px",
                                }}
                                spin
                            />
                        } 
                    />
                </div>
            }
        </div>
    )
}