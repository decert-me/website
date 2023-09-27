import { Divider, Modal } from "antd";
import { useAccount, useConnect } from "wagmi";
import { useIsMounted } from '@/hooks/useIsMounted'
import "@/assets/styles/component-style"
import { constans } from "@/utils/constans";

export default function ModalConnect(props) {

    const { isModalOpen, handleCancel } = props;
    const { defaultChainId } = constans();
    const isMounted = useIsMounted();
    const { connect, connectors } = useConnect({
        chainId: defaultChainId
    });
    const { connector, isReconnecting } = useAccount({
        onConnect() {
            handleCancel()
        }
    })

    function goConnect(x) {
        if (x.name === "WalletConnect") {
            handleCancel()
        }
        
        connect({ connector: x })
    }

    return (
        <>
        <Modal
            className="ModalConnect" 
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            closeIcon={<></>}
            width={500}
            centered
        >
            {
                connectors.map((x,i) => (
                    <div key={x.name}>
                    <div
                        className="wallet-item"
                        disabled={!x.ready || isReconnecting || connector?.id === x.id}
                        onClick={() => goConnect(x)}
                    >
                        <div className="item">
                            <div className="img">
                                {
                                    x.name === 'MetaMask' ? 
                                        <img src={require("@/assets/images/img/MetaMask.png")} alt="" />
                                        :
                                        <img src={require("@/assets/images/img/WalletConnect.png")} alt="" />
                                }
                            </div>
                            <p className="name">
                                {x.id === 'injected' ? (isMounted ? x.name : x.id) : x.name}
                            </p>
                            <p className="tips">
                                {x.name === 'MetaMask' ? 
                                'Connect to your MetaMask Wallet'
                                :'Scan with WalletConnect to connect'
                                }
                            </p>
                        </div>
                    </div>
                    {
                        i < connectors.length-1 &&
                        <Divider />
                    }
                    </div>
                ))
                }
        </Modal>
        </>
    )
}