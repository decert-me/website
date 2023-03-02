import { Badge, Button } from "antd";
import {
    TwitterOutlined,
} from '@ant-design/icons';
import { getClaimHash, submitHash } from "../../request/api/public";
import { claim } from "../../controller";
import { useSigner, useWaitForTransaction } from "wagmi";
import { useState } from "react";
import ModalLoading from "../CustomModal/ModalLoading";


export default function CustomClaim(props) {
    
    const { step, setStep, cliamObj, img, showInner, isClaim } = props;
    const { data: signer } = useSigner();
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
        setWriteLoading(true);
        const signature = await getClaimHash(cliamObj);
        if (signature.status === 0) {
            claimHash = await claim(
                cliamObj.tokenId, 
                cliamObj.score, 
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
        let title = "我通过了@DecertMe的挑战并获得了一个链上的能力认证徽章。";
        let url = `https://decert.me/quests/${cliamObj.tokenId}`;
        window.open(
        `https://twitter.com/share?text=${title}%0A&hashtags=${"DecertMe"}&url=${url}%0A`,
        );
    }

    return (
        <div className={`CustomBox ${step === 3 ? "checked-step" : ""} CustomCliam step-box ${isClaim ? "isClaim" : ""}`}>
            {
                isClaim || cacheIsClaim ? 
                "成功领取SBT"
                :
                <>
                    <ModalLoading 
                        isModalOpen={isModalOpen}
                        handleCancel ={handleCancel}
                        isLoading={isLoading}
                        img={img}
                        tokenId={cliamObj.tokenId}
                        shareTwitter={shareTwitter}
                    />
                        <Badge.Ribbon text="免手续费" >
                    <div className="box">
                        <Button disabled={step !== 3} className="share claim" onClick={() => share()}>
                            <TwitterOutlined />
                            分享领取
                        </Button>
                    </div>
                        </Badge.Ribbon>
                    <div className="box">
                        <Button className="claim" disabled={step !== 3} loading={writeLoading} onClick={() => cliam()}>立即领取</Button>
                    </div>
                </>
            }
        </div>
    )
}