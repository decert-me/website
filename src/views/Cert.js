import { Divider } from "antd";
import { useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import CertSearch from "@/components/Cert/Search";
import CertUser from "@/components/Cert/User";
import CertNfts from "@/components/Cert/Nfts";
import { getAllNft, modifyNftStatus } from "@/request/api/nft";
import NftBox from "@/components/Cert/NftBox";
import { useUpdateEffect } from "ahooks";


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
    const location = useLocation();
    let [account, setAccount] = useState();
    let [list, setList] = useState();
    let [total, setTotal] = useState();
    let [checkTotal, setCheckTotal] = useState({
        all: 0, open: 0, hide: 0
    });
    let [selectStatus, setSelectStatus] = useState();
    let [selectContract, setSelectContract] = useState();



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
        })
    }

    const changeNftStatus = (id, status) => {
        console.log(id, status);
        return
        modifyNftStatus({ID: id, status: status})
        .then(res => {
            console.log(res);
        })
    }

    const init = () => {
        account = location.pathname.split('/')[1];
        if (account.length !== 42) {
            navigateTo('/search');
            return
        }
        setAccount(account);
    }

    useEffect(() => {
        init();
    },[location])

    useUpdateEffect(() => {
        changeContract({
            address: account,
            contract_id: selectContract,
            status: selectStatus
        })
    },[selectStatus])

    return (
        account &&
        <div className="Cert">
            <div className="Cert-sidbar">
                <CertSearch />
                <Divider className="divider"  />
                <CertUser account={account} />
                <div className="mt50"></div>
                <CertNfts account={account} changeContract={changeContract} total={total} />
            </div>
            <div className="Cert-content">
                <ul>
                    <li className="active" onClick={() => {setSelectStatus(null)}}>全部({checkTotal.all})</li>
                    <li onClick={() => {setSelectStatus(2)}}>公开({checkTotal.open})</li>
                    <li onClick={() => {setSelectStatus(1)}}>隐藏({checkTotal.hide})</li>
                </ul>

                <div className="nfts">
                    {
                        list &&
                        list.map(e => 
                            <NftBox 
                                info={e}
                                changeNftStatus={changeNftStatus}
                                key={e.id}
                            />                            
                        )
                    }
                </div>
            </div>
        </div>
    )
}