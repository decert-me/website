import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "ahooks";
import { Steps } from "antd";
import { hasBindSocialAccount } from "@/request/api/public";
import { useAddress } from "@/hooks/useAddress";
import MyContext from "@/provider/context";
import StepConnect from "./step_connect";
import StepClaim from "./step_claim";
import StepSocial from "./step_social";




export default function ClaimOperate({detail, answerInfo}) {

    const { t } = useTranslation(["claim", "translation"]);
    const { isConnected } = useAddress();
    const { isMobile } = useContext(MyContext);
    const [step, setStep] = useState(0);
    let [bindObj, setBindObj] = useState();

    // 判断是否绑定社交媒体
    async function hasBindSocialAc() {
        const { data: social } = await hasBindSocialAccount();
        bindObj = social;
        setBindObj({...bindObj});
        const { discord, wechat } = social;
        return discord||wechat
    }
    
    async function initStep() {
        // 判断是否领取了
        if (detail.claimed) {
            setStep(3);
        }
        // 判断是否绑定社交
        else if (await hasBindSocialAc()) {
            setStep(2);
        }
        else{
            setStep(1);
        }
    }
    
    const decertToken = (event) => {
        event.key === "decert.token" && localStorage.getItem('decert.token') && initStep();
    }

    useEffect(() => {
        var orignalSetItem = localStorage.setItem;
        localStorage.setItem = function(key,newValue){
            var setItemEvent = new Event("setItemEvent");
            setItemEvent.key = key;
            setItemEvent.newValue = newValue;
            setItemEvent.oldValue = localStorage.getItem(key);
            window.dispatchEvent(setItemEvent);
            orignalSetItem.apply(this,arguments);
        }
        window.addEventListener('setItemEvent', decertToken)
        return () => {
            window.removeEventListener('setItemEvent', decertToken)
        }
    }, [])

    useEffect(() => {
        localStorage.getItem('decert.token') && initStep();
    },[])

    return (
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
                            <StepConnect
                                step={step}
                                setStep={(params) => setStep(params)}
                            />
                        )
                    },
                    {
                        description: (
                            <StepSocial 
                                defaultValue={bindObj}
                                step={step}
                                setStep={(params) => setStep(params)}
                            />
                        )
                    },
                    {
                        description: (
                            <StepClaim 
                                step={step}
                                setStep={(params) => setStep(params)}
                                detail={detail}
                                isMobile={isMobile}
                                answerInfo={answerInfo}
                            />
                        )
                    }
                ]}
            />
        </div>
    )
}