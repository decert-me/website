import { Button } from "antd";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi"
import ModalConnect from '@/components/CustomModal/ModalConnect';
import { NickName } from "../../utils/NickName";


export default function CustomConnect(props) {
    
    const { step, setStep } = props;
    const { address, isConnected } = useAccount();
    let [connectModal, setConnectModal] = useState();

    const cancelModalConnect = () => {
        setConnectModal(false);
    }

    const openModalConnect = () => {
        setConnectModal(true);
    }

    useEffect(() => {
        if (step === 1 && isConnected === true) {
            setStep(2);
        }
    },[isConnected])

    return (
        <div className={`CustomBox step-box ${step === 1 ? "checked-step" : ""}`}>
            <ModalConnect
                isModalOpen={connectModal} 
                handleCancel={cancelModalConnect} 
            />
            {
                isConnected === false ? 
                <>
                    <p>验证真实信息未连接钱包</p>
                    {
                        step >= 1 &&
                        <Button onClick={openModalConnect}>连接钱包</Button>
                    }
                </>
                :
                <>
                    <p>{NickName(address)}</p>
                    <p>Linked wallet</p>
                </>
            }
        </div>
    )
}