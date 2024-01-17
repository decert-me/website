import { Modal } from "antd";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { useUpdateEffect } from "ahooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomLoad from "../CustomLoad";



export default function ModalSwitchChain(props) {

    const { isModalOpen, handleCancel } = props;
    const { t } = useTranslation();
    const { chain } = useNetwork();
    const { chains, pendingChainId, switchNetworkAsync, isLoading } = useSwitchNetwork()
    const [showModal, setShowModal] = useState(false);
    
    async function switchChain(chainId) {
        try {
            await switchNetworkAsync(chainId);
            hideModal();
        } catch (error) {
            console.log("switchChain Error: ", error);
        }
    }

    function checkChain() {
        const selectChain = chains.filter(item => item.id === chain.id);
        // 不在支持链内
        if (selectChain.length === 0) {
            setShowModal(true);
        }else{
            hideModal();
        }
    }

    function hideModal() {
        handleCancel();
        setShowModal(false); 
    }

    useUpdateEffect(() => {
        // 检测是否需要切换链
        isModalOpen && checkChain();
    },[isModalOpen])
    
    return (
        <Modal
            className="ModalConnect" 
            open={showModal}
            onCancel={hideModal}
            footer={null}
            width={500}
            centered
            title={t("selectNet")}
        >
            {
                chains.map(chain => (
                    <div
                        key={chain.id}
                        className="wallet-item"
                        onClick={() => switchChain(chain.id)}
                    >
                        <div className="item">
                            <div className="img">
                                <img src={chain.img} alt="" />
                            </div>
                            <p className="name">
                                {chain.name}
                            </p>
                            {
                                isLoading && pendingChainId == chain.id &&
                                <CustomLoad />
                            }
                        </div>
                    </div>
                ))
            }
        </Modal>
    )
}