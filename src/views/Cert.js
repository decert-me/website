import { Divider, Spin } from "antd";
import {
    LoadingOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import CertSearch from "@/components/Cert/Search";
import CertUser from "@/components/Cert/User";
import CertNfts from "@/components/Cert/Nfts";
import { getAllNft, modifyNftStatus } from "@/request/api/nft";
import NftBox from "@/components/Cert/NftBox";
import { useUpdateEffect } from "ahooks";
import { useAccount } from "wagmi";
import { useAccountInit } from "@/hooks/useAccountInit";


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const location = useLocation();
    const { address: urlAddr } = useParams();
    const { address } = useAccount();

    let [isMe, setIsMe] = useState();
    let [accountAddr, setAddr] = useState();
    let [accountEns, setEns] = useState();
    let [list, setList] = useState();
    let [total, setTotal] = useState();
    let [checkTotal, setCheckTotal] = useState({
        all: 0, open: 0, hide: 0
    });
    let [pageConfig, setPageConfig] = useState({
        page: 0, pageSize: 12
    })
    let [loading, setLoading] = useState(true);
    let [selectStatus, setSelectStatus] = useState();
    let [selectContract, setSelectContract] = useState();
    const { status, addr, ens, refetch: accountInit } = useAccountInit({
        address: accountAddr,
        ensAddr: accountEns
    })

    const changeContract = async(obj) => {
        if (status === 'error' || !accountAddr) {
            setLoading(false);
            return
        }
        setSelectContract(obj.contract_id);
        pageConfig.page += 1;
        setPageConfig({...pageConfig});
        await getAllNft({
            ...obj,
            ...pageConfig
        }) 
        .then(res => {
            if (res.data) {
                list = res.data.list;
                setList([...list]);
                if (!obj.contract_id) {
                    setTotal(res.data.total);
                }
                if (!obj.status) {
                    checkTotal = {
                        all: res.data.total,
                        open: res.data.total_public,
                        hide: res.data.total_hidden
                    }
                    setCheckTotal({...checkTotal});
                }
            }
            setLoading(false);
        })
    }

    const refetch = () => {
        setLoading(true);
        setTimeout(() => {
            changeContract({
                address: accountAddr,
                contract_id: selectContract,
                status: selectStatus
            })
        }, 1000);
    }

    const changeNftStatus = (id, status) => {
        modifyNftStatus({ID: id, status: status})
        .then(res => {
            if (res) {
                refetch();
            }
        })
    }

    const init = () => {
        if (urlAddr.length !== 42) {
            // ENS
            accountEns = urlAddr;
            setEns(accountEns);
        }else{
            // ADDR
            accountAddr = urlAddr;
            setAddr(accountAddr);
            setIsMe(address === urlAddr);
        }
    }

    const initValue = async() => {
        if (urlAddr.length !== 42) {
            await accountInit()
            setAddr(addr);
        }else{
            await accountInit()
            setAddr(addr);
            setEns(ens);
        }
    }

    const io = new IntersectionObserver(ioes => {
        ioes.forEach(async(ioe) => {
            const el = ioe.target
            const intersectionRatio = ioe.intersectionRatio
            if (intersectionRatio > 0 && intersectionRatio <= 1) {
                await changeContract({
                    address: accountAddr,
                    contract_id: selectContract,
                    status: selectStatus
                })
                io.unobserve(el)
            }
            // if (!isOver) {
            //     isInViewPortOfThree()
            // }
        })
    })

    // 执行交叉观察器
    function isInViewPortOfThree () {
        io.observe(document.querySelector(".loading"))
    }

    useEffect(() => {
        // isInViewPortOfThree()

    },[])

    useEffect(() => {
        if (status === 'idle') {
            initValue()
        }
    },[status])

    useEffect(() => {
        init();
    },[location])
    
    useUpdateEffect(() => {
        changeContract({
            address: accountAddr,
            contract_id: selectContract,
            status: selectStatus
        })
    },[selectStatus])

    return (
        <div className="Cert">
            {
                (status === "success" && accountAddr) || status === "error" ?
                <>
                <div className="Cert-sidbar">
                    <CertSearch />
                    <Divider className="divider"  />
                    <CertUser account={accountAddr} ensName={accountEns} />
                    <div className="mt50"></div>
                    <CertNfts 
                        account={accountAddr} 
                        changeContract={changeContract} 
                        total={total} 
                        isMe={isMe}
                        refetch={refetch}
                        status={status}
                    />
                </div>
                <div className="Cert-content">
                    {
                        isMe &&
                        <ul>
                            <li className={!selectStatus ? "active" :"" } onClick={() => {setSelectStatus(null)}}>全部({checkTotal.all})</li>
                            <li className={selectStatus === 2 ? "active" :"" } onClick={() => {setSelectStatus(2)}}>公开({checkTotal.open})</li>
                            <li className={selectStatus === 1 ? "active" :"" } onClick={() => {setSelectStatus(1)}}>隐藏({checkTotal.hide})</li>
                        </ul>
                    }
                        <div className="nfts">
                        <div className="scroll">
                            {
                                loading ? 
                                <Spin />
                                :
                                status === "error" ? 
                                <></>
                                :
                                <>
                                {
                                    list && 
                                    list.map(e => 
                                        <NftBox 
                                            info={e}
                                            changeNftStatus={changeNftStatus}
                                            key={e.id}
                                            isMe={isMe}
                                        />                            
                                    )
                                }
                                </>
                            }
                            {
                                pageConfig.page * pageConfig.pageSize < total &&
                                <div className="loading">
                                    <Spin 
                                        indicator={
                                            <LoadingOutlined
                                                style={{
                                                fontSize: 24,
                                                }}
                                                spin
                                            />
                                        } 
                                    />
                                    <p>加载中...</p>
                                </div>
                            }
                        </div>
                    </div>
                    </div>
                </>
                :
                <Spin
                    size="large"
                    style={{
                        textAlign: "center",
                        margin: "200px auto 0"
                    }} 
                />
            }
        </div>
    )
}