import { Button, Divider } from "antd";
import { useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { getContracts } from "@/request/api/nft";
import CertSearch from "@/components/Cert/Search";
import CertUser from "@/components/Cert/User";
import CertNfts from "@/components/Cert/Nfts";


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
    const location = useLocation();
    let [account, setAccount] = useState();

    
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
                <Divider className="divider" />
                <CertNfts account={account} />
            </div>
            <div className="Cert-content">
xx
            </div>
        </div>
    )
}