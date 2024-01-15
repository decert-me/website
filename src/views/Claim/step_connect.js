import MyContext from "@/provider/context";
import { useAddress } from "@/hooks/useAddress";
import { NickName } from "@/utils/NickName";
import { useRequest } from "ahooks";
import { Button } from "antd";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConnect } from "wagmi";



export default function StepConnect({setStep, step}) {

    const { isMobile, connectWallet, connectMobile } = useContext(MyContext);
    const { t } = useTranslation(["claim"]);
    const { address } = useAddress();

    const openModalConnect = () => {
        if (isMobile) {
            connectMobile();
            return
        }
        connectWallet()
    }
    
    const { run } = useRequest(() => setStep(1), {
        debounceWait: 500,
        manual: true
    });

    const decertToken = (event) => {
        event.key === "decert.token" && step === 0 && run();
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

    return(
        <div className={`CustomBox step-box ${step === 0 ? "checked-step" : ""}`}>
            {
                step >= 0 && localStorage.getItem('decert.token') && address ? 
                <>
                    <p>{NickName(address)}</p>
                    <p>{t("wallet.connected")}</p>
                </>
                :
                <>
                    <p>{t("wallet.unconnect")}</p>
                    {
                        step >= 0 &&
                        <Button 
                            id="hover-btn-ghost" 
                            className="mw-140"
                            onClick={openModalConnect}>
                            {t("wallet.connect")}</Button>
                    }
                </>
            }
        </div>
    )
}