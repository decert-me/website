import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import CustomCompleted from "../components/CustomChallenge/CustomCompleted";
import "@/assets/styles/component-style"
import "@/assets/styles/mobile/view-style/claim.scss"
import { getQuests } from "../request/api/public";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { setMetadata } from "@/utils/getMetadata";
export default function Claim(props) {
    
    const navigateTo = useNavigate();
    const { data: signer } = useSigner({
        chainId: Number(process.env.REACT_APP_CHAIN_ID)
    });
    const { address, isDisconnected } = useAccount();
    const { questId } = useParams();

    let [detail, setDetail] = useState();
    let [answers, setAnswers] = useState();

    let [isClaim, setIsClaim] = useState(false);

    const switchStatus = async(id) => {
        // 获取tokenId ===> 
        const cache = JSON.parse(localStorage.getItem('decert.cache'));
        
        new Promise(async(resolve, reject) => {
            const res = await getQuests({id: id});
            setMetadata(res.data)
            .then(res => {
                detail = res ? res : {};
                setDetail({...detail});
                console.log("detail ==>", detail);
                if (res.claimed) {
                    resolve()
                }else{
                    reject()
                }
            })
            // getQuests({id: id})
            // .then(res => {
            //     // TODO: ==> num
            //     detail = res ? res.data : {};
            //     setDetail({...detail});
            //     if (res.data.claimed) {
            //         resolve()
            //     }else{
            //         reject()
            //     }
            // })
        }).then(res => {
            //  已领取
            // console.log(detail);

            // if (cache && cache[id]) {
            //     // 重新挑战
            //     answers = cache[id];
            //     setAnswers([...answers]);
            // }
            // 获取 分数
            setIsClaim(true);
        }).catch(err => {
            // 未领取
            if (cache && cache[id]) {
                // 已答 未领 ==>
                answers = cache[id];
                setAnswers([...answers]);
            }else{
                navigateTo(`/challenge/${id}`)
            }
        })
    }

    const init = () =>{
        questId && switchStatus(questId);
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
                    tokenId={questId} 
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