import { Modal, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { useNetwork, useSwitchNetwork } from "wagmi";
import { useUpdateEffect } from "ahooks";
import { useState } from "react";



export default function ModalSwitchChain(props) {

    const { isModalOpen, handleCancel } = props;
    const { chain } = useNetwork();
    const { chains, pendingChainId, switchNetworkAsync, isLoading } = useSwitchNetwork()
    const [showModal, setShowModal] = useState(false);
    
    async function switchChain(chainId) {
        try {
            await switchNetworkAsync(chainId);
            handleCancel();
            setShowModal(false);
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
            handleCancel();
            setShowModal(false);
        }
    }

    useUpdateEffect(() => {
        // 检测是否需要切换链
        isModalOpen && checkChain();
    },[isModalOpen])
    
    return (
        <Modal
            className="ModalConnect" 
            open={showModal}
            onCancel={handleCancel}
            footer={null}
            width={500}
            centered
            title="Select a Network"
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
                                <Spin
                                    indicator={
                                    <LoadingOutlined
                                        style={{
                                            fontSize: 24,
                                            color: "#8F5A35",
                                            marginLeft: "15px"
                                        }}
                                        spin
                                    />
                                    }
                                />
                            }
                        </div>
                    </div>
                ))
            }
        </Modal>
    )
}