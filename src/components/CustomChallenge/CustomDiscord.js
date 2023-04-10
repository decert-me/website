import { Button, message } from "antd";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { verifyDiscord } from "@/request/api/public"
import { Link } from "react-router-dom";
import { useRequest } from "ahooks";
import { useTranslation } from "react-i18next";
import { useVerifyToken } from "@/hooks/useVerifyToken";



export default function CustomDiscord(props) {

    
    const { t } = useTranslation(["claim"]);
    const { step, setStep } = props;
    const { address } = useAccount();
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
        if (isBind && step === 2) {
            setStep(3)
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
        <div className={`CustomBox step-box ${step === 2 ? "checked-step" : ""}`}>
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
                        step >= 2 &&
                        <div>
                            <Button loading={isLoading} onClick={() => onclick()} style={{marginRight: "18px"}}>
                                {t("verify")}
                            </Button>
                            <Link to={`https://discord.com/invite/${process.env.REACT_APP_DISCORD_VERIFY_CHANNEL_INVITE_LINK}`} target="_blank">
                                <Button>{t("discord.bind")}</Button>
                            </Link>
                        </div>
                    }
                </>
            }
        </div>
    )
}