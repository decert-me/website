import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { useSigner } from "wagmi";
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
export default function Claim(props) {
    
    const { defaultChainId } = constans();
    const { t } = useTranslation(["translation"]);
    const navigateTo = useNavigate();
    const { data: signer } = useSigner({
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
        const isOpenQuest = answers.filter(answer => answer.type === "open_quest");
        // TODO: 有开放题 && 未审核 ? 展示等待 : 正常显示claim

        if (isOpenQuest.length !== 0 && info?.open_quest_review_status === 1) {
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
        
        // 判断是否有开放题
        if (cache && cache[id] && hasOpenQuest(cache[id], res.data)) {
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
            if (cache && cache[id]) {
                // 已答 未领 ==>
                answers = cache[id];
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
                    <p>提交成功</p>
                    <p style={{marginTop: "45px"}}>出题者正在为您的挑战打分，请耐心等待。</p>
                    <p className="tip">由于挑战包含开放题，无固定答案，需要出题者评分。</p>
                    <Button className="btn" id="hover-btn-line" onClick={() => navigateTo(`/quests/${questId}`)}>
                        {t("btn-go-challenge")}
                    </Button>
                    <Button className="btn-link" type="link" onClick={() => navigateTo("/challenges")}>浏览其他挑战</Button>
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