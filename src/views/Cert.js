import { Button, Divider, Input } from "antd";
import {
    SearchOutlined
} from "@ant-design/icons"
import { hashAvatar } from "@/utils/HashAvatar";
import {
    CopyOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";
import "@/assets/styles/view-style/cert.scss"
import { NickName } from "@/utils/NickName";
import { useTranslation } from "react-i18next";
import { Copy } from "@/utils/Copy";
import { useLocation, useNavigate } from "react-router-dom";
import { getUser } from "@/request/api/public";
import { useVerifyAccount } from "@/hooks/useVerifyAccount";


export default function Cert(params) {
    
    const { t } = useTranslation(["translation","profile", "explore"]);
    const navigateTo = useNavigate();
    const location = useLocation();
    let [account, setAccount] = useState();
    const { verify: run, isLoading } = useVerifyAccount({address: account});


    const getInfo = async() => {
        const user = await getUser({address: account})
        if (!user.data) {
            return
        }else{
            console.log(user);
        }
    }

    const init = () => {
        account = location.pathname.split('/')[1];
        if (account.length !== 42) {
            navigateTo('/search');
            return
        }
        setAccount(account);
        getInfo();
    }

    useEffect(() => {
        init();
    },[location])


    return (
        account &&
        <div className="Cert">
            <div className="Cert-sidbar">
                <div className="search">
                    <p className="search-title">
                        搜索
                    </p>
                    <div className="search-inner">
                        <SearchOutlined className="icon" />
                        <Input bordered={false} />
                    </div>
                </div>
                <Divider className="divider"  />
                <div className="user">
                    <div className="avatar">
                        <div className="img">
                            <img src={hashAvatar(account)} alt="" />
                        </div>
                    </div>
                    <div className="user-info">
                        <p className="name">
                            {/* {info.nickname ? info.nickname : NickName(info.address)} */}
                            Dave
                        </p>
                        <p className="address" onClick={() => Copy(account, t("translation:message.success.copy"))}>
                            {NickName(account)}<CopyOutlined style={{color: "#3C6EB9", marginLeft: "12px"}} />
                        </p>
                        <Button className="share" >分享</Button>
                    </div>
                </div>
                <Divider className="divider" />
                <div className="nfts">
                    <p>SBT 收藏:</p>
                    <div className="add">
                        添加技能 SBT
                        <Button>+</Button>
                    </div>
                    <p>全部（4）</p>
                </div>
            </div>
            <div className="Cert-content">
xx
            </div>
        </div>
    )
}