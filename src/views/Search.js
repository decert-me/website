import { Button, Input } from "antd";
import {
    SearchOutlined
} from "@ant-design/icons"
import { useState } from "react";
import "@/assets/styles/view-style/search.scss"
import { useVerifyAccount } from "@/hooks/useVerifyAccount";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function Search(params) {

    let [account, setAccount] = useState("tinyxiong.eth");
    // let [account, setAccount] = useState("0xD6823f807C45eFDC56c9aE8Db0226CA10af6E8AB");
    
    const { t } = useTranslation("cert");
    const navigateTo = useNavigate();
    const { verify, isLoading} = useVerifyAccount({address: account});


    const changeAccount = (v) => {
        account = v;
        setAccount(account);
    }

    const start = async() => {
        if (account === "tinyxiong.eth") {
            setTimeout(() => {
                navigateTo(`/0xD6823f807C45eFDC56c9aE8Db0226CA10af6E8AB`)
            }, 500);
            return
        }
        const ensAddress = await verify();
        if (ensAddress) {
            setTimeout(() => {
                navigateTo(`/${account}`)
            }, 500);
        }
    }

    return (
        <div className="Search">
            <div className="Search-content">
                <p className="title">{t("vitae.title")}</p>
                <p className="subtitle">{t("vitae.subtitle")}</p>
                <div className="inner">
                    <div className="icon">
                        <SearchOutlined />
                    </div>
                    <Input placeholder={t("vitae.inner")} bordered={null} value={account} onChange={(e) => changeAccount(e.target.value.trim())} />
                    <Button onClick={() => start()} loading={isLoading} >{t("vitae.btn")}</Button>
                </div>
            </div>
        </div>
    )
}