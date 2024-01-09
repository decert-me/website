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
import { getAddressDid } from "@/request/api/zk";
import { useRequest } from "ahooks";
import { changeConnect } from "@/utils/redux";
import { submitChallenge } from "@/request/api/public";



export default function ClaimInfo({answerInfo, detail}) {
    
    const navigateTo = useNavigate();
    const { t } = useTranslation(["claim", "translation"]);
    const { walletType, isConnected, address } = useAddress();
    const { isMobile } = useContext(MyContext);
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

    // 完善资料
    function goEdit() {
        if (isConnected) {
            run();
            window.open(`/user/edit/${address}?zk`, "_blank")
        }else{
            changeConnect();
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
                        answer: JSON.stringify(answerInfo.answers),
                        uri: detail.uri
                    }
                    submitChallenge(submitObj)
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
                                        {t("getZk")}
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
                                    <>
                                        {percent}
                                        <p className="text">{t("score.now")}</p>
                                    </>
                                )}
                                strokeWidth={10}
                            />
                        </div>
                        <div className="info">
                            <p className="network newline-omitted">{detail.title}</p>
                            <p className="pass">{t("score.passScore",{score: passingPercent})}</p>
                            {
                                !isMobile && 
                                <Button className="btn" id="hover-btn-line" onClick={() => navigateTo(`/quests/${detail.tokenId}`)}>
                                    {t("translation:btn-go-challenge")}
                                </Button>
                            }
                        </div>
                    </div>
                    {
                        isMobile && 
                        <div className="mr">
                            <Button className="btn" id="hover-btn-line" onClick={() => navigateTo(`/quests/${detail.tokenId}`)}>
                                {t("translation:btn-go-challenge")}
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
                                    (walletType === "evm" || detail.claimed) &&
                                    <a href={`${walletType === "evm" ? openseaLink+"/"+detail.tokenId : openseaSolanaLink+"/"+detail.nft_address }`} className="icon" target="_blank">
                                        <img src={require("@/assets/images/icon/opensea.png")} alt="" />
                                    </a>
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