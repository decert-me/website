import bs58 from 'bs58'
import { Button, Modal } from "antd";
import { CopyOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { useTranslation } from "react-i18next";
import { backup } from "@/utils/zk/backup";
import { downloadJsonFile } from "@/utils/file/downloadJsonFile";
import { getAddressDid, getDidSignMessage, saveSignAndDid } from "@/request/api/zk";
import { createDID } from "@/utils/zk/createDID";
import "@/assets/styles/view-style/modal.scss";
import { Keyring } from "@zcloak/keyring";
import { keys } from "@zcloak/did";
import { registerDidDoc } from "@/utils/zk/didHelper";
import { Copy } from "@/utils/Copy";
import { useAddress } from "@/hooks/useAddress";
import { useWallet } from "@solana/wallet-adapter-react";

export default function BindZkBtn({clear}) {
    
    const { t } = useTranslation(["profile", "translation"]);
    const { wallet } = useWallet();
    const { walletType } = useAddress();
    const { data: signMessage } = useWalletClient();
    const [isZkLoad, setIsZkLoad] = useState(false);
    const [isBind, setIsBind] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [didID, setDidID] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [createAcLoad, setCreateAcLoad] = useState(false);
    let [keyFile, setKeyFile] = useState();

    async function downloadKeyFile() {
        try {
            downloadJsonFile(keyFile, `key_file${Date.now()}.json`)
        } catch (error) {
            console.log(error);
        }
    }

    function cancel() {
        setIsModalOpen(false);
        setIsZkLoad(false);
    }

    async function createAc() {
        setCreateAcLoad(true);
        try {
            const keyring = new Keyring();
            const did = keys.fromMnemonic(keyring, mnemonic, "ecdsa");
            // 获取msg
            const {data} = await getDidSignMessage({did: did.id})
            // 发起签名
            const message = data?.loginMessage;
            let sign_hash;
            if (walletType === "evm") {
                sign_hash = await signMessage?.signMessage({message});
            }else{
                const msg = new TextEncoder().encode(message);
                const arr = await wallet.adapter?.signMessage(msg);
                sign_hash = bs58.encode(arr);
            }

            // did publish
            const doc = await did.getPublish();
            await registerDidDoc(doc);

            // 存储keyfile
            await saveSignAndDid({
                sign_hash,
                key_file: keyFile,
                sign: data?.loginMessage,
                did_address: did.id
            });

            setIsBind(true);
            setIsModalOpen(false)
            setIsZkLoad(false);
            clear();
        } catch (error) {
            setCreateAcLoad(false);
            console.log(error);
        }
    }

    async function bindZkAc(params) {
        setIsZkLoad(true);
        const { message, did, mnemonic, nonce } = await createDID();
        setDidID(did);
        setMnemonic(mnemonic);
        // 发起签名
        try {
            let sign_hash;
            if (walletType === "evm") {
                sign_hash = await signMessage?.signMessage({message});
            }else{
                const msg = new TextEncoder().encode(message);
                const arr = await wallet.adapter?.signMessage(msg);
                sign_hash = bs58.encode(arr);
            }
            const keyFileObj = { pwd: sign_hash, nonce, mnemonic };
            // 获取keyfile
            const key_file = await backup(keyFileObj)
            keyFile = key_file;
            setKeyFile({...keyFile});
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            setIsZkLoad(false);
        }
    }

    function init() {
        getAddressDid()
        .then(res => {
            if (res.data.did) {
                setDidID(res.data.did);
                setIsBind(true);
            }
        })
    }

    useEffect(() => {
        init();
    },[])

    return (
        <>
            <div className="item-label">
                <img src={require("@/assets/images/img/did.png")} alt="" />
                {
                    isBind ?
                    <div>
                        <p>{t("profile:edit.inner.zk")}</p>
                        <p style={{fontSize: "12px", fontWeight: 500, lineHeight: "17px", marginTop: "2px"}}>
                            {didID.substring(0,11) + "..." + didID.substring(didID.length - 4, didID.length)}
                            <CopyOutlined className="icon-copy" onClick={() => Copy(didID, t("translation:message.success.copy"))} style={{color: "#9E9E9E", cursor: "pointer"}} />
                        </p>
                    </div>
                    :
                    <div>
                        <p>{t("profile:edit.inner.createZk")}</p>
                        <p>{t("profile:edit.inner.zkDesc")}</p>
                    </div>
                }
            </div>
            <Button
                id="hover-btn-full" 
                className={isBind ? "isBind" : ""}
                onClick={() => bindZkAc()}
                loading={isZkLoad}
                disabled={isBind}
            >{isBind ? t("isBind") : t("bindZk")}</Button>
            <Modal 
                title={t("creatkf.title")}
                className="modal-keyfile"
                open={isModalOpen} 
                okText={t("creatkf.btn")}
                onOk={() => createAc()} 
                cancelText={t("cancel")}
                onCancel={() => cancel()}
                okButtonProps={{
                    loading: createAcLoad
                }}
            >
                <div className="line"></div>
                <div className="did">
                    <p className="title">{t("creatkf.content.title")}</p>
                    <p className="desc">{didID.substring(0,11) + "..." + didID.substring(didID.length - 4, didID.length)}</p>
                </div>
                <div className="keyfile">
                    <p className="keyfile-title">{t("creatkf.content.backup")}</p>
                    <p className="keyfile-desc">{t("creatkf.content.desc")}</p>
                    <Button onClick={downloadKeyFile}>{t("creatkf.content.download")}</Button>
                </div>
            </Modal>
        </>
    )
}