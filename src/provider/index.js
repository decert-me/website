import bs58 from 'bs58'
import { Modal } from "antd";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { useState } from "react";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUpdateEffect } from 'ahooks';
import { useWallet } from '@solana/wallet-adapter-react';
import { submitClaimable } from "@/utils/submitClaimable";
import { authLoginSign, getLoginMsg } from "@/request/api/public";
import { ClearStorage } from "@/utils/ClearStorage";
import store from "@/redux/store";
import MyContext from "./context";
import ModalSwitchChain from '@/components/CustomModal/ModalSwitchChain';
import { particle } from '@/utils/wagmi';
const { confirm } = Modal;

export default function MyProvider(props) {

    const { connectAsync, connectors } = useConnect({
        onSuccess(data){
            localStorage.setItem("decert.address", data.account);
        }
    });
    const { disconnectAsync } = useDisconnect();
    const { refetch } = useWalletClient();
    const { address, connector } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { wallet } = useWallet();

    const [isSwitchChain, setIsSwitchChain] = useState(false);      //  切换链弹窗
    let [selectFunc, setSelectFunc] = useState(null);
    let [isMobile, setIsMobile] = useState();
    let [user, setUser] = useState();
    let [particleInfo, setParticleInfo] = useState();

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
            // 校验签名 && particle 登录添加 userInfo JSON
            const res_token = await authLoginSign({ address, message, signature: sign_hash, particle_userinfo: particleInfo });
            localStorage.setItem(`decert.token`, res_token.data.token);
            // setTimeout(() => {
            //     // 上传可领取挑战答案
            //     submitClaimable();
            // }, 100);
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
        openConnectModal()
        // setTimeout(() => {
        //     addSolanaWallet(true)
        // }, 40);
        setSelectFunc(func);
        return
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

    function addSolanaWallet(isMobile) {
        const dom = document.querySelector('[data-testid="rk-wallet-option-solana"]');
        if (dom) {
            const div = document.createElement("div");
            div.classList = `${isMobile ? "wallet-solana-mobile" : "wallet-solana"}`;
            const img = document.createElement("img");
            img.src = require("@/assets/images/img/net-Solana.png");
            const p = document.createElement("p");
            p.innerText = "Solana";
            div.appendChild(img);
            div.appendChild(p);
            const node = dom.parentNode.parentNode;
            div.addEventListener('click', function(event) {
                // close rainbowModal
                document.querySelector('[aria-labelledby="rk_connect_title"]').click()
                const btn = document.querySelector("#solana-btn button");
                btn.click();
                event.stopPropagation();
            });
            isMobile ?
            node.parentNode.insertBefore(div, node.nextSibling)
            : node.appendChild(div)
        }
    }

    async function connectWallet(func) {
        openConnectModal()
        setTimeout(() => {
            addSolanaWallet()
        }, 40);
        setSelectFunc(func);
    }

    // 存储particle第三方用户详情
    function saveUserInfo() {
        const info = particle.auth.getUserInfo();
        if (info) {            
            particleInfo = info;
            setParticleInfo({...particleInfo});
        }
    }

    // 连接钱包后发送签名
    async function sendSign(addr, walletType, adapter) {
        saveUserInfo();
        const token = localStorage.getItem("decert.token");
        if (token) return;

        try {
            const address = addr || adapter.wallet.accounts[0].address;
            let signer = walletType === "evm" ? await connector.getWalletClient() : null;
    
            localStorage.setItem("decert.address", address);
            await callSignature(address, walletType, adapter, signer);
            Modal.destroyAll();
            if (selectFunc?.goEdit) {
                await selectFunc?.goEdit(address);
                setSelectFunc(null);
            }else{
                // 检测是否需要切换链
                walletType === "evm" && setIsSwitchChain(true);
            }
        } catch (error) {
            Modal.destroyAll();
            setSelectFunc(null);
            console.log("error ===>", error);
            return;
        }
    }

    // evm
    useUpdateEffect(() => {
        connector && sendSign(address, "evm", null,);
    },[connector])

    // solana
    useUpdateEffect(() => {
        if (wallet) {
            setTimeout(() => {
                sendSign(null, "solana", wallet.adapter)
            }, 50);
        }
    },[wallet])

    return (
        <MyContext.Provider
            value={{
                isMobile,
                user,
                particleInfo,
                connectWallet,
                connectMobile,
                callSignature,
                switchChain: () => setIsSwitchChain(true)
            }}
        >
            <div id="solana-btn" style={{display: "none"}}>                    
                <WalletMultiButton>
                    <img src="" alt="" width={50} height={50} />
                    SOLANA
                </WalletMultiButton>
            </div>
            {/* 切换链 */}
            <ModalSwitchChain 
                isModalOpen={isSwitchChain}
                handleCancel={() => setIsSwitchChain(false)}
            />
            {props.children}
        </MyContext.Provider>
    );
}
