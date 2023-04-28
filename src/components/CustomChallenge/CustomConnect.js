import { Button } from "antd";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi"
import ModalConnect from '@/components/CustomModal/ModalConnect';
import { NickName } from "../../utils/NickName";
import { useRequest } from "ahooks";
import { useTranslation } from "react-i18next";
import { useWeb3Modal } from "@web3modal/react";


export default function CustomConnect(props) {
    
    const { t } = useTranslation(["claim"]);
    const { step, setStep, isMobile } = props;
    const { address } = useAccount();
    let [connectModal, setConnectModal] = useState();
    const { isOpen, open, close, setDefaultChain } = useWeb3Modal();

    const cancelModalConnect = () => {
        setConnectModal(false);
    }

    const openModalConnect = () => {
        if (isMobile) {
            open()
            return
        }
        setConnectModal(true);
    }
    
    const { run } = useRequest(() => {
        setStep(1)
    }, {
        debounceWait: 500,
        manual: true
    });

    const decertToken = (e) => {
        if (e.key === "decert.token" && step === 0) {
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
        <div className={`CustomBox step-box ${step === 0 ? "checked-step" : ""}`}>
            <ModalConnect
                isModalOpen={connectModal} 
                handleCancel={cancelModalConnect} 
            />
            {
                step >= 0 && localStorage.getItem('decert.token') ? 
                <>
                    <p>{NickName(address)}</p>
                    <p>{t("wallet.connected")}</p>
                </>
                :
                <>
                    <p>{t("wallet.unconnect")}</p>
                    {
                        step >= 0 &&
                        <Button onClick={openModalConnect}>{t("wallet.connect")}</Button>
                    }
                </>
            }
        </div>
    )
}