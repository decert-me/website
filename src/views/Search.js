import { Button, Input, message } from "antd";
import {
    SearchOutlined
} from "@ant-design/icons"
import { useState } from "react";
import "@/assets/styles/view-style/search.scss"
import "@/assets/styles/mobile/view-style/search.scss"
import { useNavigate } from "react-router-dom";
import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import { getEns } from "@/request/api/nft";
import { useAddress } from "@/hooks/useAddress";

export default function Search(params) {

    let [account, setAccount] = useState("");
    let [isLoading, setIsLoading] = useState(false);
    
    const { t } = useTranslation("cert");
    const { address } = useAddress();
    const navigateTo = useNavigate();
    const links = [
        {lable: "me", value: address},
        {lable: "vitalik.eth", value: "vitalik.eth"},
        {lable: "tinyxiong.eth", value: "tinyxiong.eth"}
    ]


    const changeAccount = (v) => {
        account = v;
        setAccount(account);
    }

    const start = async() => {
        setIsLoading(true);
        if (account.length === 44 || account.length === 49) {
            // solana钱包 || zk
            navigateTo(`/${account}`)
        }else{
            await getEns({address: account})
            .then(res => {
                if (res.data) {
                    setTimeout(() => {
                        navigateTo(`/${account}`)
                    }, 500);
                }else{
                    message.error(t("msg"))
                }
            })
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }

    return (
        <div className="Search">
            <div className="round1" />
            <div className="round2" />
            <div className="Search-content">
                <div className="title">
                    {
                        i18n.language === "zh-CN" ?
                        <img src={require("@/assets/images/img/search-title-zh.png")} alt="" />
                        :
                        <img src={require("@/assets/images/img/search-title-en.png")} alt="" />
                    }
                </div>
                <p className="subtitle">{t("vitae.subtitle")}</p>
                <div className="inner">
                    <div className="icon">
                        <SearchOutlined />
                    </div>
                    <Input placeholder={t("vitae.inner")} bordered={null} value={account} onChange={(e) => changeAccount(e.target.value.trim())} />
                    <Button disabled={!account} id="hover-btn-full" onClick={() => start()} loading={isLoading} >{t("vitae.btn")}</Button>
                </div>
                <ul className="example">
                    {
                        links.filter(e => e.value).map(e => 
                            <li key={e.lable}>
                                <p onClick={() => changeAccount(e.value)}>
                                    {e.lable}
                                </p>
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}