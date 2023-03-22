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


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
    const location = useLocation();
    let [account, setAccount] = useState();
    let [list, setList] = useState();
    let [total, setTotal] = useState();



    const changeContract = (obj) => {
        getAllNft(obj)
        .then(res => {
            console.log(res);
            if (res.data) {
                list = res.data.list;
                setList([...list]);
                if (!obj.contract_id) {
                    setTotal(res.data.total);
                }
            }
        })
    }

    const changeNftStatus = (id, status) => {
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
                    <li className="active">全部</li>
                    <li>公开</li>
                    <li>隐藏</li>
                </ul>

                <div className="nfts">
                    {
                        list &&
                        list.map(e => 
                            <NftBox info={e} changeNftStatus={changeNftStatus} />                            
                        )
                    }
                </div>
            </div>
        </div>
    )
}