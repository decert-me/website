import { Modal } from "antd";
import "@/assets/styles/component-style"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUpdateEffect } from "ahooks";
import { useAddress } from "@/hooks/useAddress";

export default function ModalConnect(props) {

    const { isModalOpen, handleCancel, onSelect } = props;
    const { isConnected } = useAddress();
    const { wallet } = useWallet();


    const wallets = [
        {name: "MetaMask", img: require("@/assets/images/img/MetaMask.png")},
        {name: "Solana Wallet", img: require("@/assets/images/img/Solana.png")},
        {name: "WalletConnect", img: require("@/assets/images/img/WalletConnect.png")},
    ]

    function goConnect(walletName) {
        handleCancel();
        onSelect(walletName)
    }

    useUpdateEffect(() => {
        isConnected && wallet && onSelect && onSelect("Solana Wallet", wallet.adapter);
    },[wallet, isConnected])

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
                wallets.map(wallet => (
                    wallet.name === "Solana Wallet" ?
                    <WalletMultiButton key={wallet.name}>
                        <div className="wallet-item" onClick={() => handleCancel()}>
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
                    :
                    <div
                        key={wallet.name}
                        className="wallet-item"
                        onClick={() => goConnect(wallet.name)}
                    >
                        <div className="item">
                            <div className="img">
                                <img src={wallet.img} alt="" />
                            </div>
                            <p className="name">
                                {wallet.name}
                            </p>
                        </div>
                    </div>
                ))
            }
        </Modal>
        </>
    )
}