import { Badge, Button } from "antd";
import {
    TwitterOutlined,
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

export default function CustomClaim(props) {
    
    const { step, cliamObj, img, showInner, isClaim, isMobile } = props;
    const { t } = useTranslation(["claim", "translation"]);
    const { chain } = useNetwork();
    const { verify } = useVerifyToken();
    const { data: signer } = useSigner();
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
            localStorage.setItem("decert.cache", JSON.stringify(cache));
            setCacheIsClaim(true);
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
        obj.score = GetScorePercent(cliamObj.totalScore, cliamObj.score);
        setWriteLoading(true);
        const signature = await getClaimHash(obj);
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
        showInner();
        shareTwitter();
    }

    const shareTwitter = () => {
        let title = t("claim.share.title", {what: "@decertme"});
        let url = t("claim.share.url", {what: `https://decert.me/quests/${cliamObj.tokenId}`});
        if (isMobile) {
            // 移动端点击分享推特处理
            const text = `${title}\r\n${url}\r\n#DeCert`
            Copy(text, t("translation:message.success.copy-share"))
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
        <div className={`CustomBox ${step === 3 ? "checked-step" : ""} CustomCliam step-box ${isClaim||cacheIsClaim ? "isClaim" : ""}`}>
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
                    <Badge.Ribbon text={t("claim.share.badge")} >
                        <div className="box">
                            <Button disabled={step !== 3} className="share claim" onClick={() => share()}>
                                <TwitterOutlined />
                                {t("claim.share.btn")}
                            </Button>
                        </div>
                    </Badge.Ribbon>
                    <div className="box">
                        <Button className="claim" disabled={step !== 3} loading={writeLoading} onClick={() => cliam()}>
                            {t("claim.btn")}
                        </Button>
                    </div>
                </>
            }
        </div>
    )
}