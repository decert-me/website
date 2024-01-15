import bs58 from 'bs58'
import { Modal } from "antd";
import { useConnect, useDisconnect, useWalletClient } from "wagmi";
import { useState } from "react";
import store from "@/redux/store";
import MyContext from "./context";
import ModalConnect from "@/components/CustomModal/ModalConnect";
import { submitClaimable } from "@/utils/submitClaimable";
import { authLoginSign, getLoginMsg } from "@/request/api/public";
import { ClearStorage } from "@/utils/ClearStorage";
import ModalSwitchChain from '@/components/CustomModal/ModalSwitchChain';
const { confirm } = Modal;

export default function MyProvider(props) {

    const { connectAsync, connectors } = useConnect({
        onSuccess(data){
            localStorage.setItem("decert.address", data.account);
        }
    });
    const { disconnectAsync } = useDisconnect();
    const { refetch } = useWalletClient();

    const [visible, setVisible] = useState(false);      //  连接钱包弹窗
    const [isSwitchChain, setIsSwitchChain] = useState(false);      //  切换链弹窗
    const [selectedWallet, setSelectedWallet] = useState(null);
    let [isMobile, setIsMobile] = useState();
    let [user, setUser] = useState();

    function handleMobileChange() {
        isMobile = store.getState().isMobile;
        setIsMobile(isMobile);
    }

    function handleUser(params) {
        user = store.getState().user;
        setUser(user);
    }

    store.subscribe(handleMobileChange);

    store.subscribe(handleUser);

    async function callSignature(address, walletType, adapter, signer) {
        openModal();
        try {
            // 获取签名信息
            const res = await getLoginMsg({ address });
            const message = res?.data?.loginMessage;
            let sign_hash = "";
            if (walletType === "evm") {
                sign_hash = await signer.signMessage({ account: address, message })
            } else {
                const msg = new TextEncoder().encode(message);
                const arr = await adapter?.signMessage(msg);
                sign_hash = bs58.encode(arr);
            }
            // 校验签名
            const res_token = await authLoginSign({ address, message, signature: sign_hash });
            localStorage.setItem(`decert.token`, res_token.data.token);
            setTimeout(() => {
                // 上传可领取挑战答案
                submitClaimable();
            }, 100);
        } catch (error) {
            if (walletType === "evm") {
                await disconnectAsync();
            }else{
                await adapter?.disconnect()
            }
            ClearStorage();
            throw new Error(error);
        }
    }

    function openModal() {
        confirm({
            title: 'Please sign the message in your wallet.',
            className: "modalSigner",
            icon: <></>,
            maskStyle: {
                backgroundColor: "rgba(0, 0, 0, 0.9)"
            },
            content: null,
            footer: null
        });
    }

    async function connectMobile(func) {
        try {
            let walletType = "evm";
            await connectAsync({ connector: connectors[1] });

            const { data: signer } = await refetch()
            const address = localStorage.getItem("decert.address");
            // 连接成功发起签名
            await callSignature(address, walletType, null, signer);
            Modal.destroyAll();

            // 某些需要在成功连接后执行的方法
            func?.goEdit && await func.goEdit(address);

            // 检测是否需要切换链
            setIsSwitchChain(true);
        } catch (error) {
            Modal.destroyAll();
            console.log("error ===>", error);
            return;
        }
    }

    async function connectWallet(func) {
        setVisible(true);
        try {
            // 选择钱包
            const { wallet, adapter } = await new Promise((resolve) => {
                setSelectedWallet({ resolve });
            });
            let walletType = "evm";
            // 通过返回的钱包名开始连接
            switch (wallet) {
                case "MetaMask":
                    await connectAsync({ connector: connectors[0] });
                    break;
                case "Solana Wallet":
                    walletType = "solana";
                    localStorage.setItem("decert.address", adapter.wallet.accounts[0].address);
                    break;
                case "WalletConnect":
                    await connectAsync({ connector: connectors[1] });
                    break;
                default:
                    break;
            }
            const { data: signer } = await refetch()
            const address = localStorage.getItem("decert.address");
            // 连接成功发起签名
            await callSignature(address, walletType, adapter, signer);
            Modal.destroyAll();

            // 某些需要在成功连接后执行的方法
            func?.goEdit && await func.goEdit(address);

            // 检测是否需要切换链
            setIsSwitchChain(true);
        } catch (error) {
            Modal.destroyAll();
            console.log("error ===>", error);
            return;
        }
    }

    return (
        <MyContext.Provider
            value={{
                isMobile,
                user,
                connectWallet,
                connectMobile,
                callSignature,
                switchChain: () => setIsSwitchChain(true)
            }}
        >
            {/* 连接钱包 */}
            <ModalConnect
                isModalOpen={visible}
                onSelect={(wallet, adapter) =>
                    selectedWallet?.resolve({ wallet, adapter })
                }
                handleCancel={() => setVisible(false)}
            />
            {/* 切换链 */}
            <ModalSwitchChain 
                isModalOpen={isSwitchChain}
                handleCancel={() => setIsSwitchChain(false)}
            />
            {props.children}
        </MyContext.Provider>
    );
}
