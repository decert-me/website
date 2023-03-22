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
import { useAccount, useEnsAddress } from "wagmi";


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
    const location = useLocation();
    const { address: urlAddr } = useParams();
    const { address } = useAccount();

    let [isMe, setIsMe] = useState();
    let [account, setAccount] = useState();
    let [list, setList] = useState();
    let [total, setTotal] = useState();
    let [checkTotal, setCheckTotal] = useState({
        all: 0, open: 0, hide: 0
    });
    
    let [loading, setLoading] = useState(true);
    let [selectStatus, setSelectStatus] = useState();
    let [selectContract, setSelectContract] = useState();
    const { data, isSuccess } = useEnsAddress({
        name: account
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
                address: account,
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
        account = urlAddr;
        setIsMe(address === urlAddr);
        if (account.length !== 42) {
            navigateTo('/search');
            return
        }
        setAccount(account);
    }

    useEffect(() => {
        init();
    },[location])

    useEffect(() => {
        if (isSuccess) {
            setAccount(data);
        }
    },[isSuccess])

    useUpdateEffect(() => {
        changeContract({
            address: account,
            contract_id: selectContract,
            status: selectStatus
        })
    },[selectStatus])

    return (
        account && data &&
        <div className="Cert">
            <div className="Cert-sidbar">
                <CertSearch />
                <Divider className="divider"  />
                <CertUser account={account} />
                <div className="mt50"></div>
                <CertNfts 
                    account={account} 
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
                        <li className="active" onClick={() => {setSelectStatus(null)}}>全部({checkTotal.all})</li>
                        <li onClick={() => {setSelectStatus(2)}}>公开({checkTotal.open})</li>
                        <li onClick={() => {setSelectStatus(1)}}>隐藏({checkTotal.hide})</li>
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
        </div>
    )
}