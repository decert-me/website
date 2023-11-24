import { useEffect, useState } from "react"
import { useWalletClient } from "wagmi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomCompleted from "../components/CustomChallenge/CustomCompleted";
import "@/assets/styles/component-style"
import "@/assets/styles/mobile/view-style/claim.scss"
import { getQuests } from "../request/api/public";
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Modal, Spin } from 'antd';
import { setMetadata } from "@/utils/getMetadata";
import { localRealAnswerInit } from "@/utils/localRealAnswerInit";
import { useTranslation } from "react-i18next";
import { modalNotice } from "@/utils/modalNotice";
import { constans } from "@/utils/constans";
import { useAddress } from "@/hooks/useAddress";
import { useUpdateEffect } from "ahooks";
export default function Claim(props) {
    
    const location = useLocation();
    const { defaultChainId } = constans();
    const { t } = useTranslation(["translation"]);
    const navigateTo = useNavigate();
    const { data: signer } = useWalletClient({
        chainId: defaultChainId
    });
    const { address } = useAddress();
    const { questId } = useParams();
    const [isWaitting, setIsWaitting] = useState();

    let [detail, setDetail] = useState();
    let [answers, setAnswers] = useState();

    let [isClaim, setIsClaim] = useState(false);
    let [isChange, setIsChange] = useState(false);


    function realAnswerInit(cacheAnswers) {
        const id = questId;
        const { flag } = localRealAnswerInit({
            cacheAnswers, 
            id, 
            detail, 
            reload: () => {
                // TODO: 弹窗提示 ===> 跳转
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
        isChange = !flag;
        setIsChange(isChange);
    }

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

    const switchStatus = async(id) => {
        // 获取tokenId ===> 
        const cache = JSON.parse(localStorage.getItem('decert.cache'));
        const res = await getQuests({id: id});

        // 判断是否有答案
        if (!cache[id] && !res.data.answer) {
            navigateTo(`/challenge/${id}`)
            return
        }
        
        // 判断是否有开放题
        if (hasOpenQuest(cache[id]||res.data.answer, res.data)) {
            return
        }
        new Promise(async(resolve, reject) => {
            try {                
                setMetadata(res.data)
                .then(res => {
                    detail = res ? res : {};
                    setDetail({...detail});
                    if (res.claimed) {
                        resolve()
                    }else{
                        reject()
                    }
                })
            } catch (error) {
                navigateTo("/404")
            }
        }).then(res => {
            //  已领取
            // console.log(detail);

            // if (cache && cache[id]) {
            //     // 重新挑战
            //     answers = cache[id];
            //     setAnswers([...answers]);
            // }
            // 获取 分数
            setIsChange(true);
            setIsClaim(true);
        }).catch(err => {
            // 未领取
            if ((cache && cache[id]) || detail?.answer) {
                // 已答 未领 ==> 获取后端数据
                answers = detail?.answer || cache[id];
                setAnswers([...answers]);
                realAnswerInit(cache)
            }else{
                navigateTo(`/challenge/${id}`)
            }
        })
    }

    const init = () =>{
        questId && switchStatus(questId);
    }

    useUpdateEffect(() => {
        navigateTo(0);
    },[location])

    useEffect(() => {
        init()
    },[signer])

    return (
        <div className="Claim">
            {
                detail && isChange && ( !isClaim || isClaim && address ) ?
                <CustomCompleted 
                    answers={answers} 
                    detail={detail} 
                    tokenId={questId} 
                    isClaim={isClaim}
                    address={address}
                />
                :
                isWaitting ?
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