import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import CustomCompleted from "../components/CustomChallenge/CustomCompleted";
import { balanceOf } from "../controller";
import "@/assets/styles/component-style"



export default function Claim(props) {
    
    const location = useLocation();
    const navigateTo = useNavigate();
    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();
    let [tokenId, setTokenId] = useState();
    let [detail, setDetail] = useState();
    let [answers, setAnswers] = useState();

    const switchStatus = (id, num) => {
        // 获取tokenId ===> 
        const cache = localStorage.getItem('decert.cache');
        console.log('num ===>', num);
        if (cache && num == 0) {
            // 已答 未领 ==>
            console.log('===> 未领取');
            detail = JSON.parse(cache)[id].detail;
            answers = JSON.parse(cache)[id].answers;
            setDetail({...detail});
            setAnswers([...answers]);
        }else if (num == 1) {
            console.log('===> 已领取');
            // 已答 已领 ==>
            // 获取 分数
            
        }else{
            // 未答 未领 ==>
            navigateTo(`/challenge/${id}`)
        }
    }

    const init = async() =>{
        tokenId = location?.pathname?.split("/")[2];
        setTokenId(tokenId);
        const num = await balanceOf(address, tokenId, signer);
        tokenId && switchStatus(tokenId, num);
    }

    useEffect(() => {
        init()
    },[])

    return (
        <div className="Claim">
            {
                detail &&
                <CustomCompleted answers={answers} detail={detail} tokenId={tokenId} />
            }
        </div>
    )
}