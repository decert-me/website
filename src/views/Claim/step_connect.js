import { useAddress } from "@/hooks/useAddress";
import MyContext from "@/provider/context";
import { NickName } from "@/utils/NickName";
import { changeConnect } from "@/utils/redux";
import { useRequest } from "ahooks";
import { Button } from "antd";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConnect } from "wagmi";



export default function StepConnect({setStep, step}) {

    const { isMobile } = useContext(MyContext);
    const { t } = useTranslation(["claim"]);
    const { address } = useAddress();
    const { connect, connectors } = useConnect({
        onError(err){
            console.log(err);
        }
    })

    const openModalConnect = () => {
        if (isMobile) {
            connect({connector: connectors[1]})
            return
        }
        changeConnect()
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
                        <Button id="hover-btn-ghost" onClick={openModalConnect}>{t("wallet.connect")}</Button>
                    }
                </>
            }
        </div>
    )
}