import { Badge, Button, Modal, Popover, Spin } from "antd";
import {
    TwitterOutlined,
    WechatOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { getClaimHash, getQuests, hasClaimed, submitHash } from "../../request/api/public";
import { useNetwork, useWalletClient, useSwitchNetwork, useWaitForTransaction, useContractWrite } from "wagmi";
import { useContext, useEffect, useState } from "react";
import ModalLoading from "../CustomModal/ModalLoading";
import { GetScorePercent } from "@/utils/GetPercent";
import { useTranslation } from "react-i18next";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import { Copy } from "@/utils/Copy"
import { useNavigate } from "react-router-dom";
import { modalNotice } from "@/utils/modalNotice";
import { QRCodeSVG } from "qrcode.react";
import { useRequest } from "ahooks";
import { constans } from "@/utils/constans";
import ModalAirdrop from "../CustomModal/ModalAirdrop";
import MyContext from "@/provider/context";

export default function CustomClaim(props) {
    
    const navigateTo = useNavigate();
    const { step, setStep, cliamObj, img, shareWechat, isClaim, isMobile, detail } = props;
    const { ipfsPath, defaultImg,  defaultChainId } = constans();
    const { t } = useTranslation(["claim", "translation"]);
    const { badgeMinterContract } = useContext(MyContext);
    const { chain } = useNetwork();
    const { verify } = useVerifyToken();
    const { data: signer } = useWalletClient();
    let [open, setOpen] = useState();
    let [link, setLink] = useState("");
    let [status, setStatus] = useState(0);
 
    let [isSwitch, setIsSwitch] = useState(false);
    let [showPopover, setShowPopover] = useState(false);
    let [claimHash, setClaimHash] = useState();
    let [cacheIsClaim, setCacheIsClaim] = useState();

    let [isModalOpen, setIsModalOpen] = useState();
    let [isModalAirdropOpen, setIsModalAirdropOpen] = useState();
    let [writeLoading, setWriteLoading] = useState();
       
    const { switchNetwork } = useSwitchNetwork({
        chainId: defaultChainId,
        onError(error) {
            setIsSwitch(false);
        },
        onSuccess() {
            setIsSwitch(false);
        }
    })

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
        },
        cacheTime: 0

    })

    const { writeAsync: claim } = useContractWrite({
        ...badgeMinterContract,
        functionName: 'claim',
    })

    const { runAsync } = useRequest(shareWechat, {
        debounceWait: 500,
        manual: true
    });

    const { data, run, cancel } = useRequest(refetch, {
        pollingInterval: 3000,
        manual: true,
        pollingWhenHidden: false
    });

    const goclaim = async() => {

        if (chain.id != defaultChainId) {
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
            const { hash: claimHash } = await claim({ args: [obj.tokenId, obj.score, signature.data] })
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

    async function share(params) {
        // TODO: 添加二维码弹出
        if (!link) {            
            const code = await runAsync();
            link = window.location.origin + "/quests/" + cliamObj.tokenId + "?code=" + code
            setLink(link);
        }
        setShowPopover(!showPopover);
        isMobile && setOpen(true);
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

    // 轮询获取当前详情
    async function refetch(params) {
        const res = await hasClaimed({id: cliamObj.tokenId});
        status = res?.data?.status;
        setStatus(status);
        if (res?.data?.status === 2) {
            const cache = JSON.parse(localStorage.getItem('decert.cache'));
            delete cache[cliamObj.tokenId];
            if (cache?.claimable) {
                cache.claimable = cache.claimable.filter(obj => obj.token_id != cliamObj.tokenId);
            }
            localStorage.setItem("decert.cache", JSON.stringify(cache));
            setCacheIsClaim(true);
            setStep(3)
            cancel()
        }
    }

    async function airpost(params) {
        if (step === 2 && status === 0) {
            // 弹出框
            setIsModalAirdropOpen(true);
            status = 1;
            setStatus(status);
            await runAsync();
            run();
        }
    }

    async function init(params) {
        await refetch()
        if (status === 1) {
            run()
        }
    }

    useEffect(() => {
        if (isSwitch && switchNetwork) {
            switchNetwork()
        }
    },[switchNetwork, isSwitch])
    
    useEffect(() => {
        step >= 2 && init()
    },[step])

    return (
        //  css:  ${isClaim || cacheIsClaim ? "" : "CustomCliam" }
        <div className={`CustomBox ${step === 2 ? "checked-step" : ""} step-box ${isClaim||cacheIsClaim ? "isClaim" : ""}`}
            style={{
                justifyContent: "center",
                cursor: step === 2 && status === 0 && "pointer"
            }}
            onClick={() => airpost()}
            
        >
            {/* {
                isModalAirdropOpen &&
                <ModalAirdrop
                    isModalAirdropOpen={isModalAirdropOpen}
                    closeModal={() => {setIsModalAirdropOpen(false)}}
                    img={img}
                    isMobile={isMobile}
                    detail={detail}
                    status={status}
                />
            } */}
            {/* <ModalLoading 
                isModalOpen={isModalOpen}
                handleCancel ={handleCancel}
                isLoading={isLoading}
                img={img}
                tokenId={cliamObj.tokenId}
                shareTwitter={shareTwitter}
                detail={detail}
            />
            <Modal 
                className="modal-tip"
                open={open} 
                onCancel={() => setOpen(false)}
                footer={null}
                closeIcon={<CloseOutlined />}
            >
                <div className="share-link">
                    <h3>{t("translation:share")}</h3>
                    <div className="link">{link}</div>
                    <Button 
                        type="primary" 
                        id="hover-btn-full"
                        onClick={() => Copy(link, t("translation:message.success.copy"))}
                    >{t("translation:btn-share")}</Button>
                </div>
            </Modal>
            {
                isClaim || cacheIsClaim ? 
                t("claim.claimed")
                :
                <>
                    <Badge.Ribbon text={t("claim.share.badge")} className="custom-badge" color={step !== 2 ? "#CBCBCB" : "blue"}>
                        <Popover
                            content={(
                                <div className="qrcode">
                                    <Spin spinning={!link} size="large" wrapperClassName="qrcop">
                                        <QRCodeSVG size={104} value={link} />
                                    </Spin>
                                    <div
                                        style={{
                                            width: 122,
                                            display: "flex",
                                            alignItems: "flex-start",
                                            marginTop: 17
                                        }}
                                    >
                                        <WechatOutlined /><p>{t("translation:share-text")}</p>
                                    </div>
                                </div>
                            )}
                            overlayClassName={`qrcode-box ${isMobile ? "hide" : ""}`}
                            getPopupContainer={() => document.querySelector(".Claim")}
                            placement="rightBottom"
                            open={showPopover}
                        >
                            <div className="box">
                                <Button id={step !== 2 ? "" : "hover-btn-full"} disabled={step !== 2 || writeLoading} className="share claim" onClick={() => share()}>
                                    <WechatOutlined />
                                    {t("claim.share.btn")}
                                </Button>
                            </div>
                        </Popover>
                    </Badge.Ribbon>

                    <div className="box">
                        <Button className="claim" id={step !== 2 ? "" : "hover-btn-full"} disabled={step !== 2 || showPopover} loading={writeLoading} onClick={() => goclaim()}>
                            {t("claim.btn")}
                        </Button>
                    </div>
                    
                </>
            } */}
            {
                step < 2 ? 
                    t("claim.btn")
                :
                isClaim || cacheIsClaim ? 
                    t("claim.claimed")
                :
                status === 0 ?
                    t("claim.btn")
                :
                    t("claim.wait")
            }
        </div>
    )
}