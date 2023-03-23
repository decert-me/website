import { Divider, Spin } from "antd";
import { useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CertSearch from "@/components/Cert/Search";
import CertUser from "@/components/Cert/User";
import CertNfts from "@/components/Cert/Nfts";
import { getAllNft, modifyNftStatus } from "@/request/api/nft";
import NftBox from "@/components/Cert/NftBox";
import { useUpdateEffect } from "ahooks";
import { useAccount, useEnsAddress, useEnsName } from "wagmi";
import { ethers } from "ethers";
import { useAccountInit } from "@/hooks/useAccountInit";


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
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
    
    let [loading, setLoading] = useState(true);
    let [selectStatus, setSelectStatus] = useState();
    let [selectContract, setSelectContract] = useState();
    const { status, addr, ens, refetch: accountInit } = useAccountInit({
        address: accountAddr,
        ensAddr: accountEns
    })

    const changeContract = (obj) => {
        setSelectContract(obj.contract_id);
        getAllNft(obj) 
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
            console.log(accountEns);
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
                status === "success" ?
                <>
                <div className="Cert-sidbar">
                    <CertSearch />
                    <Divider className="divider"  />
                    <CertUser account={accountAddr} />
                    <div className="mt50"></div>
                    <CertNfts 
                        account={accountAddr} 
                        changeContract={changeContract} 
                        total={total} 
                        isMe={isMe}
                        refetch={refetch}
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
                        {
                            loading ? 
                            <Spin />
                            :
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