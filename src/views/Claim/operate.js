import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

    function stepDotInit() {
        const doms = document.querySelectorAll(".ant-steps .ant-steps-item-container");
        for (let i = 0; i < doms.length - 1; i++) {
            const dom = doms[i];
            const dot = document.createElement("div");
            dot.classList.add("custom-dot");
            if (isMobile) {
                dot.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
            }else{
                dot.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
            }
            dom.appendChild(dot);
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
        stepDotInit();
    },[])

    return (
        <div className="step">
            <h5>{t("step.title")}</h5>
            <div className="tips">
                {t("choose")}
            </div>
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