import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Divider, Progress } from "antd";
import Confetti from "react-confetti";
import MyContext from "@/provider/context";
import CustomViewer from "@/components/CustomViewer";
import ClaimOperate from "./operate";
import { useAddress } from "@/hooks/useAddress";
import { constans } from "@/utils/constans";
import { generateCard, getAddressDid } from "@/request/api/zk";
import { useRequest } from "ahooks";
import { CONTRACT_ADDR_1155, CONTRACT_ADDR_1155_TESTNET, CONTRACT_ADDR_721, CONTRACT_ADDR_721_TESTNET } from "@/config";



export default function ClaimInfo({answerInfo, detail}) {
    
    const isDev = process.env.REACT_APP_IS_DEV;
    const navigateTo = useNavigate();
    const { t } = useTranslation(["claim", "translation"]);
    const { walletType, isConnected, address } = useAddress();
    const { isMobile, connectWallet } = useContext(MyContext);
    const { score, passingPercent, isPass } = answerInfo
    const { openseaLink, openseaSolanaLink, defaultImg, ipfsPath } = constans(null, detail.version); 
    const [hasDID, setHasDID] = useState(false);
    const [pollingCount, setPollingCount] = useState(0);

    const { run, cancel } = useRequest(polling, {
        pollingInterval: 3000,
        manual: true
    });

    function polling() {
        setPollingCount(pollingCount + 1);
        addrDid()
        if (pollingCount === 60) {
            cancel();
            setPollingCount(0);
        }
    }

    // opensea跳转链接
    function openseaHref() {
        const { version, nft_address, badge_chain_id, badge_token_id } = detail;
        let evmLink = openseaLink;
        const solanaLink = `${openseaSolanaLink}/${nft_address}`;
        if (walletType === "solana") {
            return solanaLink
        }

        if (version == 1) {
            evmLink = `${evmLink}/${isDev ? "mumbai" : "matic"}/${isDev ? CONTRACT_ADDR_1155_TESTNET?.Badge : CONTRACT_ADDR_1155?.Badge}/${badge_token_id}`;
        }else{
            const chainAddr = isDev ? CONTRACT_ADDR_721_TESTNET[badge_chain_id] : CONTRACT_ADDR_721[badge_chain_id];
            evmLink = `${evmLink}/${chainAddr?.opensea}/${chainAddr?.Badge}/${badge_token_id}`
        }
        return evmLink
    }

    // 完善资料
    function goEdit() {
        if (isConnected) {
            run();
            window.open(`/user/edit/${address}?zk`, "_blank")
        }else{
            connectWallet({
                goEdit: (address) => {
                    run();
                    window.open(`/user/edit/${address}?zk`, "_blank")
                }
            });
        }
    }

    function addrDid(params) {
        getAddressDid()
        .then(res => {
            if (res.data.did) {
                // 若为后置登陆 需再次发送challenge
                if (!hasDID) {
                    const submitObj = {
                        token_id: detail.tokenId,
                    }
                    generateCard(submitObj)
                }
                setHasDID(true);
                cancel();
                setPollingCount(0);
            }
        })
    }

    useEffect(() => {
        isPass && isConnected && addrDid()
    },[isPass, isConnected])

    return(
        <div className="CustomCompleted">
            {
                isPass && 
                <Confetti
                    width={document.documentElement.clientWidth} 
                    height={document.documentElement.clientHeight} 
                    numberOfPieces={500}
                    recycle={false}
                />
            }
            <div className="completed-content">
                <div className="content-info">
                    <div className="desc">
                    {
                        isPass ? 
                            <>
                               <p className="title">{t("pass")}  🎉🎉</p>
                               {
                                    hasDID ? 
                                    <p className="zk">
                                        {t("getZk")}&nbsp;
                                        <span onClick={() => window.open(`/user/${address}?type=0&status=2`, "_blank")}>{t("getZkLink")}</span>
                                    </p>
                                    :
                                    <p className="zk">
                                        {t("zkDesc")}
                                        <span onClick={()=>goEdit()}>{t("zkCreate")}</span>
                                    </p>
                               }
                            </>
                        :
                            <p className="title">{t("unpass")}</p>
                    }
                    </div>
                    <div className="score">
                        <div className="circle">
                            <Progress
                                type="circle"
                                className={isPass ? "pass" : "unpass"}
                                percent={score / 100}
                                size={isMobile ? 126 : 208}
                                strokeColor={
                                    isPass ? 
                                    { '0%': '#5AD68D', '100%': '#43B472'}
                                    :
                                    { '0%': '#F46565', '100%': '#B64444'}
                                }
                                format={(percent) => (
                                    detail.open_quest_review_status === 0 ? 
                                    (
                                        <>
                                            {percent}
                                            <p className="text">{t("score.now")}</p>
                                        </>
                                    )
                                    :
                                    (
                                        isPass ?
                                        <p className="text-unpass">{t("score.pass")}</p>
                                        :
                                        <p className="text-unpass">{t("score.unpass")}</p>
                                    )
                                )}
                                strokeWidth={10}
                            />
                        </div>
                        <div className="info">
                            <p className="network newline-omitted">{detail.title}</p>
                            {
                                detail.open_quest_review_status === 0 &&
                                <p className="pass">{t("score.passScore",{score: passingPercent})}</p>
                            }
                            {
                                !isMobile && 
                                <div className="btns-flex">
                                    <Button className="btn" id="hover-btn-line" onClick={() => navigateTo(`/quests/${detail.tokenId}`)}>
                                        {t("translation:btn-go-challenge")}
                                    </Button>
                                    <Button className="btn" id="hover-btn-full" onClick={() => navigateTo(`/challenge/${detail.tokenId}`)}>
                                        {t("translation:btn-go-rechallenge")}
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="annotation">
                        <p className="annotation-title">批注</p>
                        <div className="annotation-list">
                            {
                                detail.answer.map((item, index) => (
                                    <div key={index} className="annotation-item" onClick={() => navigateTo(`/challenge/${detail.uuid}?${index}`)}>
                                        <div className="left">
                                            <p>题目#{index+1}</p>
                                            <p>{item.annotation}</p>
                                        </div>
                                        <p>查看</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    {
                        isMobile && 
                        <div className="mr">
                            <Button className="btn" id="hover-btn-line" onClick={() => navigateTo(`/quests/${detail.tokenId}`)}>
                                {t("translation:btn-go-challenge")}
                            </Button>
                            <Button className="btn" id="hover-btn-full" onClick={() => navigateTo(`/challenge/${questId}`)}>
                                {t("translation:btn-go-rechallenge")}
                            </Button>
                        </div>
                    }
                    {
                        !isPass && detail.recommend && !detail.claimed &&
                        <div className="viewer" >
                            <div className="viewer-head">
                                <p>{t("recommend")}</p>
                            </div>
                            <Divider />
                            <div className="viewer-content">
                                <CustomViewer label={detail.recommend} />
                            </div>
                        </div>
                    }
                </div>
                {
                    isPass && 
                    <div className="content-step">
                        <div className="nft">
                            <div className="img">
                                <img className="sbt"
                                    src={
                                        detail.metadata.image.split("//")[1]
                                            ? `${ipfsPath}/${detail.metadata.image.split("//")[1]}`
                                            : defaultImg
                                    }
                                    alt="" 
                                />
                                {
                                    (detail.claimed) &&
                                    <a 
                                        href={openseaHref()} 
                                        className="icon" 
                                        target="_blank"
                                    >
                                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                                    </a>
                                }
                                {/* 阴影文本: ERC-721展示 */}
                                {
                                    detail?.version === "2" &&
                                    <div className="img-mask">
                                        <p className="newline-omitted">{detail.title}</p>
                                    </div>
                                }
                            </div>
                        </div>
                        <ClaimOperate 
                            detail={detail}
                            answerInfo={answerInfo}
                        />
                    </div>
                }
            </div>
        </div>
    )
}