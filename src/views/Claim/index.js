import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Modal, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { useAddress } from "@/hooks/useAddress";
import { getQuests } from "@/request/api/public";
import { localRealAnswerInit } from "@/utils/localRealAnswerInit";
import { modalNotice } from "@/utils/modalNotice";
import { Encryption } from "@/utils/Encryption";
import { GetPercent } from "@/utils/GetPercent";
import ClaimInfo from "./info";




export default function Claim(params) {
    
    const navigateTo = useNavigate();
    const { decode } = Encryption();
    const { questId } = useParams();
    const { address } = useAddress();
    const { t } = useTranslation(["translation"]);

    const [isWaitting, setIsWaitting] = useState();     //  开放题等待
    let [detail, setDetail] = useState();               //  该挑战详情
    let [answerInfo, setAnswerInfo] = useState({
        score: null,        //  得分
        passingPercent: null,       //  及格分
        isPass: null        //  是否通过
    });


    /**
     * 判断是否有开放题 ? 判断是否审核 : 跳出判断
     * 判断开放题是否审核 ? 等待 : 正常显示
     */
    function hasOpenQuest(answers, info) {
        const isOpenQuest = answers.filter(answer => answer?.type === "open_quest");
        // 有开放题 && 未审核 ? 展示等待 : 正常显示claim
        if (isOpenQuest.length !== 0 && info?.open_quest_review_status !== 2) {
            setIsWaitting(true);
            return true
        }else{
            return false
        }
    }

    // 判断当前挑战是否更新
    function realAnswerInit(cacheAnswers, detail) {
        const id = questId;
        const { flag } = localRealAnswerInit({
            cacheAnswers, 
            id, 
            detail, 
            reload: () => {
                // 弹窗提示 ===> 跳转
                Modal.warning({
                    ...modalNotice({
                        t, 
                        text: t("translation:message.error.challenge-modify"), 
                        onOk: () => {navigateTo(0)},
                        icon: "🤖"
                    }
                )});
            }
        })
        return flag     //  false: 没有修改 true: 修改了
    }

    // 计算挑战分数
    function getScore(answer) {
        const userAnswer = answer;
        const realAnswer = eval(decode(detail.quest_data.answers));
        const questions = detail.quest_data.questions;
        let totalScore = 0;
        let score = 0;
        let successNum = 0;

        realAnswer.map((e,i) => {
            // 通过答案类型判断题型 ===>
            totalScore += Number(questions[i].score);
            if (e === null) {
                if (userAnswer[i]?.correct) {
                    score+=Number(questions[i].score);
                    successNum+=1;
                }
            }else if (typeof e === 'object') {
                if (JSON.stringify(e) == JSON.stringify(userAnswer[i]?.value) || JSON.stringify(e) == JSON.stringify(userAnswer[i])) {
                    score+=questions[i].score;
                    successNum+=1;
                }
            }else if (typeof e === "number") {
                if (e === userAnswer[i]?.value) {
                    score+=questions[i].score;
                    successNum+=1;
                }
            }else{
                if (userAnswer[i]?.value && e == userAnswer[i].value) {
                    score+=questions[i].score;
                    successNum+=1;
                }
            }
        })
        answerInfo = {
            isPass: score >= detail.quest_data.passingScore,
            score: GetPercent(totalScore, score),
            answers: userAnswer,
            passingPercent: GetPercent(totalScore, detail.quest_data.passingScore),
        }
        setAnswerInfo({...answerInfo});

        // 缓存可领取状态修改
        const cache = JSON.parse(localStorage.getItem("decert.cache"));
        let claimable = cache?.claimable ? cache.claimable : [];
        if (answerInfo.isPass) {
            if (!claimable.some(item => item.token_id == questId)) {
                const add_ts = Math.floor(Date.now() / 1000);
                claimable.push({
                    token_id: Number(questId),
                    add_ts
                })
            }
        }else{
            // 未通过，查找cache中是否有该缓存，有则清除
            claimable = claimable.filter(e => e.token_id !== Number(questId));
        }
        cache.claimable = claimable;
        localStorage.setItem("decert.cache", JSON.stringify(cache))
    }

    async function init() {
        const cache = JSON.parse(localStorage.getItem('decert.cache'));
        const res = await getQuests({id: questId});
        const dataAnswer = res.data.answer;

        // 判断是否有答案
        if (!cache[questId] && !dataAnswer) {
            navigateTo(`/challenge/${questId}`)
            return
        }

        // 判断是否有开放题 || 判断当前挑战是否更新(后端没有答案的情况下校验本地缓存) 
        if ((dataAnswer && hasOpenQuest(dataAnswer, res.data)) || (!dataAnswer && realAnswerInit(cache, res.data))) {
            return
        }

        detail = res.data;
        setDetail({...detail});
        // Feat: 重新挑战 ===> 已领取该sbt 判断是否是重新挑战
        // 判断是否领取了该sbt ? 有两种人 ===> 已登陆 & 未登录
        if (res.data?.claimed) {
            const questions = detail.quest_data.questions;
            const totalScore = questions.reduce((total, obj) => total + obj.score, 0);
            answerInfo = {
                isPass: true,
                answers: dataAnswer,
                score: res.data.user_score,
                passingPercent: GetPercent(totalScore, detail.quest_data.passingScore),
            }
            setAnswerInfo({...answerInfo});
        }else{
            // 获取后端答案数据 ==> 计算分数
            getScore(dataAnswer||cache[questId])
        }
    }

    useEffect(() => {
        init();
    },[address])

    return (
        <div className="Claim">
            {
                detail && typeof answerInfo.isPass === "boolean" ?   
                <ClaimInfo 
                    answerInfo={answerInfo}
                    detail={detail}
                />
                :
                <div className="claim-loading">
                    <Spin
                        indicator={
                            <LoadingOutlined style={{fontSize: "50px"}} spin />
                        } 
                    />
                </div>
            }


            {/* 开放题判题loading */}
            {
                isWaitting &&
                <div className="waiting">
                    <div className="box">
                        <img className="icon-wait" src={require("@/assets/images/icon/icon-wait.png")} alt="" />
                        <p>{t("message.success.submit.title")}</p>
                    </div>
                    <div className="box">
                        <img className="icon-info" src={require("@/assets/images/icon/icon-info.png")} alt="" />
                        <p className="tip">{t("message.success.submit.score")}</p>
                    </div>
                    <Button className="btn" id="hover-btn-line" onClick={() => navigateTo(`/quests/${questId}`)}>
                        {t("btn-go-challenge")}
                    </Button>
                    <Button className="btn-link" type="link" onClick={() => navigateTo("/challenges")}>{t("btn-another")}</Button>
                </div>
            }
        </div>
    )
}