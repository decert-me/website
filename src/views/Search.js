import { Button, Input } from "antd";
import {
    SearchOutlined
} from "@ant-design/icons"
import { useState } from "react";
import "@/assets/styles/view-style/search.scss"
import { useVerifyAccount } from "@/hooks/useVerifyAccount";
import { useNavigate } from "react-router-dom";


export default function Search(params) {

    let [account, setAccount] = useState();
    const navigateTo = useNavigate();
    const { verify, isLoading} = useVerifyAccount({address: account});


    const changeAccount = (v) => {
        account = v;
        setAccount(account);
    }

    const start = async() => {
        const ensAddress = await verify();
        if (ensAddress) {
            setTimeout(() => {
                navigateTo(`/${ensAddress}`)
            }, 500);
        }
    }

    return (
        <div className="Search">
            <div className="Search-content">
                <p className="title">What have you built .</p>
                <p className="subtitle">A collection of your Internet identity portals</p>
                <div className="inner">
                    <div className="icon">
                        <SearchOutlined />
                    </div>
                    <Input placeholder="Search by address" bordered={null} onChange={(e) => changeAccount(e.target.value)} />
                    <Button onClick={() => start()} loading={isLoading} >Get started</Button>
                </div>
            </div>
        </div>
    )
}