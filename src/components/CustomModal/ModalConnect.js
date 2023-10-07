import { Modal } from "antd";
import { useAccount, useConnect } from "wagmi";
import { useIsMounted } from '@/hooks/useIsMounted'
import "@/assets/styles/component-style"
import { constans } from "@/utils/constans";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

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
            width={500}
            centered
            title="Connect your wallet."
        >
            {
                connectors.map((x,i) => (
                    <div
                        key={x.name}
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
                        </div>
                    </div>
                ))
                }
            <WalletMultiButton>
                <div className="wallet-item">
                    <div className="item">
                        <div className="img">
                            <img src={(require("@/assets/images/img/Solana.png"))} alt="" />
                        </div>
                        <p className="name">
                            Solana Wallet
                        </p>
                    </div>
                </div>
            </WalletMultiButton>
        </Modal>
        </>
    )
}