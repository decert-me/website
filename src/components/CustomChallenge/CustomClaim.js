import { Button } from "antd";
import {
    TwitterOutlined,
} from '@ant-design/icons';
import { getClaimHash } from "../../request/api/public";
import { claim } from "../../controller";
import { useSigner, useWaitForTransaction } from "wagmi";
import { useState } from "react";
import ModalLoading from "../CustomModal/ModalLoading";


export default function CustomClaim(props) {
    
    const { step, setStep, cliamObj, img } = props;
    const { data: signer } = useSigner();
    let [claimHash, setClaimHash] = useState();

    let [isModalOpen, setIsModalOpen] = useState();
    let [writeLoading, setWriteLoading] = useState();
    const { isLoading } = useWaitForTransaction({
        hash: claimHash
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
            setIsModalOpen(true);
            if (claimHash) {
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

    return (
        <div className={`CustomBox CustomCliam step-box ${step === 3 ? "checked-step" : ""}`}>
            <ModalLoading 
                isModalOpen={isModalOpen}
                handleCancel ={handleCancel}
                isLoading={isLoading}
                img={img}
                tokenId={cliamObj.tokenId}
            />
            {/* <div className="box">
                <p>免手续费领取SBT</p>
                <Button className="share"><TwitterOutlined style={{color: "#0495d7"}} />立即分享</Button>
            </div> */}
            <div className="box">
                <p>立即领取SBT</p>
                <Button loading={writeLoading} onClick={() => cliam()}>立即铸造</Button>
            </div>
        </div>
    )
}