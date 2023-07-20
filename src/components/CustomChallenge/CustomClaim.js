import { Badge, Button, Modal, Popover } from "antd";
import {
    TwitterOutlined,
    WechatOutlined
} from '@ant-design/icons';
import { getClaimHash, submitHash } from "../../request/api/public";
import { claim } from "../../controller";
import { useNetwork, useSigner, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { useEffect, useState } from "react";
import ModalLoading from "../CustomModal/ModalLoading";
import { GetScorePercent } from "@/utils/GetPercent";
import { useTranslation } from "react-i18next";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { Copy } from "@/utils/Copy"
import { useNavigate } from "react-router-dom";
import { modalNotice } from "@/utils/modalNotice";
import { QRCodeSVG } from "qrcode.react";

export default function CustomClaim(props) {
    
    const { step, setStep, cliamObj, img, showInner, isClaim, isMobile } = props;
    const { t } = useTranslation(["claim", "translation"]);
    const navigateTo = useNavigate();
    const { chain } = useNetwork();
    const { verify } = useVerifyToken();
    const { data: signer } = useSigner();
    const [open, setOpen] = useState(false);

    const { switchNetwork } = useSwitchNetwork({
        chainId: Number(process.env.REACT_APP_CHAIN_ID),
        onError(error) {
            setIsSwitch(false);
        },
        onSuccess() {
            setIsSwitch(false);
        }
    })
    let [isSwitch, setIsSwitch] = useState(false);
    let [claimHash, setClaimHash] = useState();
    let [cacheIsClaim, setCacheIsClaim] = useState();

    let [isModalOpen, setIsModalOpen] = useState();
    let [writeLoading, setWriteLoading] = useState();
    const { isLoading } = useWaitForTransaction({
        hash: claimHash,
        onSuccess() {
            // 清除cache
            const cache = JSON.parse(localStorage.getItem('decert.cache'));
            delete cache[cliamObj.tokenId];
            if (cache?.claimable) {
                cache.claimable = cache.claimable.filter(obj => obj.token_id != cliamObj.tokenId);
            }
            localStorage.setItem("decert.cache", JSON.stringify(cache));
            setCacheIsClaim(true);
            setStep(3)
        }
    })

    const cliam = async() => {

        if (chain.id != process.env.REACT_APP_CHAIN_ID) {
            setIsSwitch(true);
            return
        }

        let hasHash = true;
        await verify()
        .catch(() => {
            hasHash = false;
        })
        if (!hasHash) {
            return
        }
        let obj = {...cliamObj};
        obj.uri = obj.uri[obj.tokenId]
        obj.score = GetScorePercent(cliamObj.totalScore, cliamObj.score);
        setWriteLoading(true);
        const signature = await getClaimHash(obj);
        if (signature.message.indexOf("Question Updated") !== -1 || signature.message.indexOf("题目已更新") !== -1 ) {
            Modal.warning({
                ...modalNotice({
                    t, 
                    text: t("translation:message.error.challenge-modify"), 
                    onOk: () => {navigateTo(0)},
                    icon: "😵"
                }
            )});
            return
        }
        if (signature) {
            claimHash = await claim(
                obj.tokenId, 
                obj.score, 
                signature.data, 
                signer
            )
            setClaimHash(claimHash);
            setWriteLoading(false);

            if (claimHash) {
                submitHash({hash: claimHash})
                // 弹出等待框
                setIsModalOpen(true);
            }
        }else{
            setWriteLoading(false);
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    const share = () => {
        // TODO: 添加二维码弹出
        // showInner();
        // shareTwitter();
        setOpen(true)
    }

    const shareTwitter = () => {
        let title = t("claim.share.title", {what: "@decertme"});
        let url = t("claim.share.url", {what: `https://decert.me/quests/${cliamObj.tokenId}`});
        if (isMobile) {
            // 移动端点击分享推特处理
            const text = `${title}\r\n${url}\r\n#DeCert`
            const newStr = text.replace(/%0A/g, '\n');
            Copy(newStr, t("translation:message.success.copy-share"))
            return
        }
        window.open(
        `https://twitter.com/share?text=${title}%0A&hashtags=${"DeCert"}&url=${url}%0A`,
        );
    }

    useEffect(() => {
        if (isSwitch && switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork, isSwitch])

    return (
        <div className={`CustomBox ${step === 2 ? "checked-step" : ""} ${isClaim || cacheIsClaim ? "" : "CustomCliam" } step-box ${isClaim||cacheIsClaim ? "isClaim" : ""}`}>
            <ModalLoading 
                isModalOpen={isModalOpen}
                handleCancel ={handleCancel}
                isLoading={isLoading}
                img={img}
                tokenId={cliamObj.tokenId}
                shareTwitter={shareTwitter}
            />
            {
                isClaim || cacheIsClaim ? 
                t("claim.claimed")
                :
                <>
                        <Badge.Ribbon text={t("claim.share.badge")} className="custom-badge" color={step !== 2 ? "#CBCBCB" : "blue"}>
                    <Popover
                        content={(
                            <div className="qrcode">
                                <QRCodeSVG size={104} value="https://reactjs.org/" />
                                <p><WechatOutlined />微信扫码分享</p>
                            </div>
                        )}
                        overlayClassName="qrcode-box"
                        getPopupContainer={() => document.querySelector(".Claim")}
                        trigger="click"
                        placement="rightBottom"
                    >
                            <div className="box">
                                <Button id={step !== 2 ? "" : "hover-btn-full"} disabled={step !== 2} className="share claim" onClick={() => share()}>
                                    <TwitterOutlined />
                                    {t("claim.share.btn")}
                                </Button>
                            </div>
                    </Popover>
                    </Badge.Ribbon>

                    <div className="box">
                        <Button className="claim" id={step !== 2 ? "" : "hover-btn-full"} disabled={step !== 2} loading={writeLoading} onClick={() => cliam()}>
                            {t("claim.btn")}
                        </Button>
                    </div>
                    
                </>
            }
        </div>
    )
}