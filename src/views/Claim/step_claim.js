import ModalAirdrop from "@/components/CustomModal/ModalAirdrop";
import ModalSelectChain from "@/components/CustomModal/ModalSelectChain";
import { hasClaimed, wechatShare } from "@/request/api/public";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";



export default function StepClaim({step, setStep, detail, isMobile, answerInfo}) {
    

    const { t } = useTranslation(["claim", "translation"]);
    const { score, passingPercent, isPass, answers } = answerInfo
    const [isModalNetwork, setIsModalNetwork] = useState(false);
    let [status, setStatus] = useState(0);
    let [isModalAirdropOpen, setIsModalAirdropOpen] = useState();
    let [cacheIsClaim, setCacheIsClaim] = useState();

    const { runAsync } = useRequest(shareWechat, {
        debounceWait: 500,
        manual: true
    });

    const { data, run, cancel } = useRequest(refetch, {
        pollingInterval: 3000,
        manual: true,
        pollingWhenHidden: false
    });

    async function airpost(chainId) {
        
        if (step === 2 && status === 0) {
            // 弹出框
            setIsModalAirdropOpen(true);
            status = 1;
            setStatus(status);
            await runAsync(chainId);
            run();
        }
    }

    async function shareWechat(chainId) {
        const data = {
            tokenId: detail.tokenId,
            score: score,
            answer: JSON.stringify(answers),
            chain_id: chainId
        }
        // const {version} = detail

        // return await wechatShare({data, version})
        // .then(res => {
        //     return res?.status === 0 ? res.data : null
        // })
        return await wechatShare(data)
        .then(res => {
            return res?.status === 0 ? res.data : null
        })
    }

    // 轮询获取当前详情
    async function refetch(params) {
        const res = await hasClaimed({id: detail.tokenId});
        status = res?.data?.status;
        setStatus(status);
        if (res?.data?.status === 2) {
            const cache = JSON.parse(localStorage.getItem('decert.cache'));
            delete cache[detail.tokenId];
            if (cache?.claimable) {
                cache.claimable = cache.claimable.filter(obj => obj.token_id != detail.tokenId);
            }
            localStorage.setItem("decert.cache", JSON.stringify(cache));
            setCacheIsClaim(true);
            setStep(3)
            cancel()
        }
    }

    function closeModal() {
        isModalAirdropOpen = false;
        setIsModalAirdropOpen(isModalAirdropOpen);
    }

    async function init(params) {
        await refetch()
        if (status === 1) {
            run()
        }
    }

    useEffect(() => {
        step >= 2 && init()
    },[step])

    return (
        <>
        {
            isModalAirdropOpen &&
            <ModalAirdrop
                isModalAirdropOpen={isModalAirdropOpen}
                closeModal={closeModal}
                img={detail.metadata.image}
                isMobile={isMobile}
                detail={detail}
                status={status}
            />
        }
        <ModalSelectChain
            isModalOpen={isModalNetwork} 
            handleCancel={() => setIsModalNetwork(false)} 
            airpost={airpost}
        />
        <div className={`CustomBox ${step === 2 ? "checked-step" : ""} step-box ${detail.claimed||cacheIsClaim ? "isClaim" : ""}`}
            style={{
                justifyContent: "center",
                cursor: step === 2 && status === 0 && "pointer"
            }}
            onClick={() => {
                step === 2 && status === 0 && setIsModalNetwork(true)
            }}
        >
            {
                step < 2 ? 
                    t("claim.btn")
                :
                detail.claimed || cacheIsClaim ? 
                    t("claim.claimed")
                :
                status === 0 ?
                    t("claim.btn")
                :
                    t("claim.wait")
            }
        </div>
        </>
    )
}