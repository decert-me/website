


import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import { useTranslation } from "react-i18next";
import { backup } from "@/utils/zk/backup";
import { downloadJsonFile } from "@/utils/file/downloadJsonFile";
import { getAddressDid, saveSignAndDid } from "@/request/api/zk";
import { createDID } from "@/utils/zk/createDID";
import "@/assets/styles/view-style/modal.scss";


export default function BindZkBtn() {
    
    const { t } = useTranslation(["profile"]);
    const { data: signMessage } = useSigner();
    const [isZkLoad, setIsZkLoad] = useState(false);
    const [isBind, setIsBind] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [didID, setDidID] = useState("");
    let [keyFile, setKeyFile] = useState();

    async function downloadKeyFile() {
        try {
            downloadJsonFile(keyFile, `key_file${Date.now()}.json`)
        } catch (error) {
            console.log(error);
        }
    }

    async function bindZkAc(params) {
        setIsZkLoad(true);
        const { message, did, mnemonic, nonce } = await createDID();
        setDidID(did);
        // 发起签名
        try {
            const sign_hash = await signMessage?.signMessage(message);
            const keyFileObj = { pwd: sign_hash, nonce, mnemonic };
            const signObj = { sign: message, did_address: did };
            // 获取keyfile
            const key_file = await backup(keyFileObj)
            keyFile = key_file;
            setKeyFile({...keyFile});
            // 存储keyfile
            await saveSignAndDid({
                ...signObj,
                key_file
            })
            setIsBind(true);
            setIsModalOpen(true);
            setIsZkLoad(false);
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
                        <p style={{fontSize: "12px", fontWeight: 500, lineHeight: "17px", marginTop: "2px"}}>{didID.substring(0,11) + "..." + didID.substring(didID.length - 4, didID.length)}</p>
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
                title={"DID Account Creation"}
                className="modal-keyfile"
                open={isModalOpen} 
                okText={"Create Account"}
                onOk={()=>setIsModalOpen(false)} 
                cancelText={t("cancel")}
                onCancel={()=>setIsModalOpen(false)}
            >
                <div className="line"></div>
                <div className="did">
                    <p className="title">Your DID will be :</p>
                    <p className="desc">{didID.substring(0,11) + "..." + didID.substring(didID.length - 4, didID.length)}</p>
                </div>
                <div className="keyfile">
                    <p className="keyfile-title">Backup your Keysfile</p>
                    <p className="keyfile-desc">
                    Kindly ensure the secure storage of your seed phrase, as it will be necessary for account recovery. Additionally, refrain from sharing it with others, as it could grant unauthorized access to your digital assets.
                    </p>
                    <Button onClick={downloadKeyFile}>下载 Keysfile</Button>
                </div>
            </Modal>
        </>
    )
}