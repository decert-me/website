import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRequest, useUpdateEffect } from "ahooks";
import { Button, message } from "antd";
import { hasBindSocialAccount } from "@/request/api/public";
import { useAddress } from "@/hooks/useAddress";


export default function StepSocial({step, setStep, defaultValue}) {
    
    const { address } = useAddress();
    const { t } = useTranslation(["claim", "translation", "profile"]);
    const [count, setCount] = useState(0);
    const [pollingCount, setPollingCount] = useState(0);
    const [loading, setLoading] = useState(false);
    let [bindObj, setBindObj] = useState({
        discord: false,
        wechat: false
    })

    // 轮询检测是否绑定social ===>
    const { run, cancel } = useRequest(polling, {
        pollingInterval: 3000,
        manual: true
    });

    function polling() {
        setPollingCount(pollingCount + 1);
        hasBindSocialAc()
        if (pollingCount === 60) {
            setLoading(false);
            cancel();
            setPollingCount(0);
        }
    }

    // 去完善资料
    function goInformation() {
        setLoading(true);
        window.open(`/user/edit/${address}`);
        run();
    }

    // 初始化检测是否绑定了 dicord || wechat
    function hasBindSocialAc() {
        const notice = localStorage.getItem("decert.bind.notice");
        if (notice) {
            message.error(notice);
            localStorage.removeItem("decert.bind.notice");
            setLoading(false);
            cancel();
            return
        }
        hasBindSocialAccount()
        .then(res => {
            if (res.status === 0) {
                const { discord, wechat } = res.data;
                bindObj = res.data;
                setBindObj({...bindObj});
                if ((discord || wechat) && step === 1) {
                    setStep(2);
                    setLoading(false);
                    cancel();
                }else if (count === 100 || (discord && wechat)) {
                    setLoading(false);
                    cancel();
                    setCount(0);
                }else{
                    setCount(count+1);
                }
                
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    useUpdateEffect(() => {
        step === 1 && hasBindSocialAc();
    },[step])

    useUpdateEffect(() => {
        if (defaultValue) {
            bindObj = defaultValue;
            setBindObj({...bindObj});
        }
    },[defaultValue])


    return (
        // TODO: 改为新标签页 跳转,原页面轮询
        <div className={`CustomBox step-box ${step === 1 ? "checked-step" : ""}`}>
            <p>{t("bindAc")}</p>
            {
                (bindObj.discord || bindObj.wechat) ?
                <p>{t("profile:isBind")}</p>
                :
                step >= 0 &&
                <Button 
                    id="hover-btn-ghost" 
                    className="mw-140"
                    loading={loading}
                    disabled={!step >= 1} 
                    onClick={() => goInformation()}
                >{t("profile:edit.inner.bindAc")}</Button>
            }
        </div>
    )
}