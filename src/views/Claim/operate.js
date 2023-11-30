import { useAddress } from "@/hooks/useAddress";
import MyContext from "@/provider/context";
import { useUpdateEffect } from "ahooks";
import { Steps } from "antd";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StepConnect from "./step_connect";
import StepClaim from "./step_claim";
import StepSocial from "./step_social";



export default function ClaimOperate({detail, answerInfo}) {

    const { t } = useTranslation(["claim", "translation"]);
    const { isMobile } = useContext(MyContext);
    const { isConnected } = useAddress();
    const [step, setStep] = useState(1);
    
    function initStep() {
        // 判断是否登陆
        if (!isConnected || !localStorage.getItem('decert.token')) {
            step = 0;
        } else {
            // TODO: 判断是否绑定vx、discord

        }


        // TODO: 是否领取
    }

    useEffect(() => {
        // initStep();
    },[])

    useUpdateEffect(() => {
        // initStep();
    },[step])

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
                                step={step}
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