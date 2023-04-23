import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import CustomCompleted from "../components/CustomChallenge/CustomCompleted";
import { balanceOf } from "../controller";
import "@/assets/styles/component-style"
import "@/assets/styles/mobile/view-style/claim.scss"
import { getQuests } from "../request/api/public";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

export default function Claim(props) {
    
    const location = useLocation();
    const navigateTo = useNavigate();
    const { data: signer } = useSigner();
    const { address, isDisconnected } = useAccount();

    let [tokenId, setTokenId] = useState();
    let [detail, setDetail] = useState();
    let [answers, setAnswers] = useState();

    let [isClaim, setIsClaim] = useState(false);

    const switchStatus = async(id, num) => {
        // 获取tokenId ===> 
        const cache = JSON.parse(localStorage.getItem('decert.cache'));
        console.log(cache);
        await getQuests({id: id})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
            console.log(detail);
        })
        if (cache && cache[id] && (num == 0 || !num)) {
            // 已答 未领 ==>
            answers = cache[id];
            setAnswers([...answers]);
        }else if (num == 1) {
            // 已答 已领 ==>
            if (cache && cache[id]) {
                // 重新挑战
                answers = cache[id];
                setAnswers([...answers]);
            }
            // 获取 分数
            setIsClaim(true);
        }else if ((num == 0 || !num)){
            // 未答 未领 ==>
            navigateTo(`/challenge/${id}`)
        }
    }

    const init = () =>{
        tokenId = location?.pathname?.split("/")[2];
        setTokenId(tokenId);

        tokenId && signer &&
        balanceOf(address, tokenId, signer)
        .then(res => {
            switchStatus(tokenId, res);
        })
        tokenId && !address && switchStatus(tokenId);
    }

    useEffect(() => {
        init()
    },[signer, address])

    return (
        <div className="Claim">
            {
                detail ?
                <CustomCompleted 
                    answers={answers} 
                    detail={detail} 
                    tokenId={tokenId} 
                    isClaim={isClaim}
                />
                :
                <div className="claim-loading">
                    <Spin 
                        indicator={
                            <LoadingOutlined
                                style={{
                                fontSize: "50px",
                                }}
                                spin
                            />
                        } 
                    />
                </div>
            }
        </div>
    )
}