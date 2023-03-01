import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import CustomCompleted from "../components/CustomChallenge/CustomCompleted";
import { balanceOf } from "../controller";
import "@/assets/styles/component-style"
import { getQuests } from "../request/api/public";



export default function Claim(props) {
    
    const location = useLocation();
    const navigateTo = useNavigate();
    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();
    let [tokenId, setTokenId] = useState();
    let [detail, setDetail] = useState();
    let [answers, setAnswers] = useState();

    const switchStatus = async(id, num) => {
        // 获取tokenId ===> 
        const cache = localStorage.getItem('decert.cache');
        await getQuests({id: tokenId})
        .then(res => {
            detail = res ? res.data : {};
            setDetail({...detail});
        })
        if (cache && num == 0) {
            // 已答 未领 ==>
            console.log('===> 未领取');
            answers = JSON.parse(cache)[id];
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