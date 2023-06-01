import {
    SearchOutlined
} from "@ant-design/icons"
import { useRequest } from "ahooks";
import { Input } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export default function CertSearch(props) {

    const navigateTo = useNavigate();
    const { address } = useParams();
    let [account, setAccount] = useState();
    const { t } = useTranslation(["cert"]);

    const goCert = () => {
        if (!account) {
            return
        }
        navigateTo(`/${account}`, {replace: true});
        navigateTo(0);
    }

    const { runAsync: debounce } = useRequest(goCert, {
        debounceWait: 1000,
        manual: true
    });

    const changeAccount = (v) => {
        account = v;
        setAccount(account);
        debounce();
    }

    useEffect(() => {
        account = address;
        setAccount(account)
    },[address])


    return (
        <div className="search">
            <p className="search-title">
                {t("sidbar.search")}
            </p>
            <div className="search-inner">
                <SearchOutlined className="icon" />
                <Input placeholder={t("sidbar.rule")} bordered={false} value={account} onChange={(e) => changeAccount(e.target.value.trim())} />
            </div>
        </div>
    )
}