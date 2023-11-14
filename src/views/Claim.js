import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { useWalletClient } from "wagmi";
import CustomCompleted from "../components/CustomChallenge/CustomCompleted";
import "@/assets/styles/component-style"
import "@/assets/styles/mobile/view-style/claim.scss"
import { getQuests } from "../request/api/public";
import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
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
    const { data: signer } = useWalletClient({
        chainId: defaultChainId
    });
    const { address } = useAddress();
    const { questId } = useParams();

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

    const switchStatus = async(id) => {
        // 获取tokenId ===> 
        const cache = JSON.parse(localStorage.getItem('decert.cache'));
        
        new Promise(async(resolve, reject) => {
            try {                
                const res = await getQuests({id: id});
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