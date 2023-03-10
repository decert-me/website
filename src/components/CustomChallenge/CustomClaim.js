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


export default function CustomClaim(props) {
    
    const { step, cliamObj, img, showInner, isClaim } = props;
    const { chain } = useNetwork();
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
        let obj = {...cliamObj};
        obj.score = GetScorePercent(cliamObj.totalScore, cliamObj.score);
        if (chain.id != process.env.REACT_APP_CHAIN_ID) {
            setIsSwitch(true);
            return
        }

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
        let title = "我在 @DecertMe 上完成了一个挑战并获得了链上能力认证的徽章。";
        let url = `https://decert.me/quests/${cliamObj.tokenId}`;
        window.open(
        `https://twitter.com/share?text=${title}%0A&hashtags=${"DecertMe"}&url=${url}%0A`,
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
                "已领取SBT"
                :
                <>
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