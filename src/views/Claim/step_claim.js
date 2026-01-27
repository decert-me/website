import ModalAirdrop from "@/components/CustomModal/ModalAirdrop";
import ModalSelectChain from "@/components/CustomModal/ModalSelectChain";
import { hasClaimed, wechatShare, confirmUserMint } from "@/request/api/public";
import { useRequest } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import GenerateImg from "./generateImg";
import { useAddress } from "@/hooks/useAddress";
import { message } from "antd";
import { mintNFTWithBackendSignature } from "@/utils/badgeMinterHelper";



export default function StepClaim({step, setStep, detail, isMobile, answerInfo}) {


    const generateImgRef = useRef();
    const { address, walletType } = useAddress();
    const { t } = useTranslation(["claim", "translation"]);
    const { score, passingPercent, isPass, answers } = answerInfo

    const [isModalNetwork, setIsModalNetwork] = useState(false);
    const [airpostLoading, setAirpostLoading] = useState(true);
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

    async function goAirpost(params) {
        if (step === 2 && status === 0) {            
            if (walletType === "evm") {
                setIsModalNetwork(true);
            }else{
                setIsModalAirdropOpen(true);
                status = 1;
                setStatus(status);
                try {
                    const image = await generateImgRef.current.generate(
                        detail.metadata.image.replace("ipfs://", "https://ipfs.decert.me/"),
                        detail.title
                    )
                    await runAsync({chainId: null, image});
                    run();
                } catch (error) {
                    message.error(t("message.claim-error"))
                    status = 0;
                    setStatus(status);
                    setIsModalAirdropOpen(false);
                }
            }
        }
    }

    async function airpost(chainId) {
        console.log('[DEBUG airpost] Function called with chainId:', chainId);
        console.log('[DEBUG airpost] step:', step, 'status:', status);
        console.log('[DEBUG airpost] Current address:', address);

        if (step === 2 && status === 0) {
            // 弹出框
            setIsModalAirdropOpen(true);
            status = 1;
            setStatus(status);
            try {
                // 生成img
                const image = await generateImgRef.current.generate(
                    detail.metadata.image.replace("ipfs://", "https://ipfs.decert.me/"),
                    detail.title
                )
                const uri = "ipfs://"+image;

                // 优先使用用户自付费 mint 流程
                try {
                    console.log('[用户自付费] 尝试使用用户自付费 mint 流程');
                    console.log('[用户自付费] chainId:', chainId, 'tokenId:', detail.tokenId, 'score:', score);

                    // 使用新的自主 mint 流程：调用后端获取签名，然后用户调用合约
                    const receipt = await mintNFTWithBackendSignature(
                        chainId,
                        detail.tokenId,
                        score,
                        JSON.stringify(answers),
                        uri
                    );

                    console.log('[用户自付费] ✅ Mint 成功! Transaction receipt:', receipt);

                    // Mint 成功后，调用后端确认 API 更新数据库状态
                    console.log('[用户自付费] 📡 调用后端确认 API 更新数据库状态...');
                    try {
                        await confirmUserMint({
                            token_id: detail.tokenId,
                            tx_hash: receipt.transactionHash
                        });
                        console.log('[用户自付费] ✅ 后端状态更新成功');
                    } catch (confirmError) {
                        console.error('[用户自付费] ⚠️ 后端状态更新失败:', confirmError);
                        // 即使后端更新失败，也不影响前端显示，因为链上已经 mint 成功
                    }

                    // 更新前端状态和缓存
                    console.log('[用户自付费] 🎉 更新前端状态');

                    // 清除缓存
                    const cache = JSON.parse(localStorage.getItem('decert.cache'));
                    delete cache[detail.tokenId];
                    if (cache?.claimable) {
                        cache.claimable = cache.claimable.filter(obj => obj.uuid != detail.uuid);
                    }
                    localStorage.setItem("decert.cache", JSON.stringify(cache));

                    // 更新状态
                    setCacheIsClaim(true);
                    setStatus(2);
                    setAirpostLoading(false);
                    setStep(3);  // 跳转到完成步骤

                } catch (userPaidError) {
                    // 用户自付费失败，降级到后端空投逻辑
                    console.warn('[用户自付费] ❌ 用户自付费失败，降级到后端空投逻辑');
                    console.warn('[用户自付费] 错误信息:', userPaidError);

                    console.log('[后端空投] 使用后端空投逻辑');
                    await runAsync({chainId, image});
                    run();
                }
            } catch (error) {
                console.error('[DEBUG] Mint/Airdrop failed:', error);
                message.error(t("message.claim-error"))
                status = 0;
                setStatus(status);
                setIsModalAirdropOpen(false);
            }
        }
    }

    async function shareWechat({chainId,image}) {
        const data = {
            tokenId: detail.tokenId,
            score: score,
            answer: JSON.stringify(answers),
            chain_id: chainId,
            image_uri: "ipfs://"+image
        }
        // const {version} = detail

        // return await wechatShare({data, version})
        // .then(res => {
        //     return res?.status === 0 ? res.data : null
        // })
        return await wechatShare(data)
        .then(res => {
            setAirpostLoading(false);
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
                cache.claimable = cache.claimable.filter(obj => obj.uuid != detail.uuid);
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
                airpostLoading={airpostLoading}
            />
        }
        <ModalSelectChain
            isModalOpen={isModalNetwork} 
            handleCancel={() => setIsModalNetwork(false)} 
            airpost={airpost}
        />

        {/* 生成图片 */}
        <GenerateImg ref={generateImgRef} />
        <div className={`CustomBox ${step === 2 ? "checked-step" : ""} step-box ${detail.claimed||cacheIsClaim ? "isClaim" : ""}`}
            style={{
                justifyContent: "center",
                cursor: step === 2 && status === 0 && "pointer"
            }}
            onClick={() => goAirpost()}
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