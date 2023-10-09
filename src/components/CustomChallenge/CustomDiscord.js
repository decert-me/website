import { Button, message } from "antd";
import { useEffect, useState } from "react"
import { verifyDiscord } from "@/request/api/public"
import { useRequest } from "ahooks";
import { useTranslation } from "react-i18next";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { useAddress } from "@/hooks/useAddress";



export default function CustomDiscord(props) {

    
    const { t } = useTranslation(["claim"]);
    const { step, setStep } = props;
    const { address } = useAddress();
    const { verify: verifyHash } = useVerifyToken();
    let [isBind, setIsBind] = useState();
    let [username, setUsername] = useState();
    let [isLoading, setIsLoading] = useState();

    const verify = async(isClick) => {
        let hasHash = true;
        await verifyHash()
        .catch(() => {
            hasHash = false;
        })
        if (!hasHash) {
            return
        }

        if (!address) {
            return
        }
        verifyDiscord({address: address, isClick: isClick})
        .then(res => {
            isBind = !res ? false : res.data ? true : false;
            setIsBind(isBind);
            username = isBind && res.data?.username ? res.data.username : null;
            setUsername(username);
            if (isClick && res) {
                message.success(res.message);
            }
        })
    }

    const { run } = useRequest(verify, {
        debounceWait: 500,
        manual: true
    });

    const onclick = () => {
        setIsLoading(true);
        run(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }
    
    useEffect(() => {
        if (isBind && step === 1) {
            setStep(2)
        }
    },[isBind])

    useEffect(() => {
        run();
    },[step])

    const decertToken = (e) => {
        if (e.key === "decert.token") {
            run()
        }
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

    return (
        <div className={`pl70 CustomBox step-box ${step === 1 ? "checked-step" : ""}`}>
            <div className="icon">
                <img 
                    src={require("@/assets/images/img/discord-none.png")} 
                    alt="" 
                    style={step >= 1 ? {filter: "brightness(200%)"} : {}}
                />
            </div>
            {
                isBind ? 
                <>
                    <p>{username}</p>
                    <p>{t("discord.binded")}</p>
                </>
                :
                <>
                    <p>{t("discord.unbind")}</p>
                    {
                        <div>
                            <Button className="discord-box" id={step >= 1 ? "hover-btn-ghost" : ""} loading={isLoading} disabled={!step >= 1} onClick={() => onclick()}>
                                {t("verify")}
                            </Button>
                            <Button 
                                disabled={!step >= 1} 
                                id={step >= 1 ? "hover-btn-ghost" : ""} 
                                onClick={() => 
                                    window.open(`https://discord.com/invite/${process.env.REACT_APP_DISCORD_VERIFY_CHANNEL_INVITE_CODE}`, "_blank")
                                }>
                                {t("discord.bind")}
                            </Button>
                        </div>
                    }
                </>
            }
        </div>
    )
}