import { useEnsAddress, usePrepareSendTransaction } from "wagmi";
import { Button, Input, message } from "antd";
import {
    SearchOutlined
} from "@ant-design/icons"
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/search.scss"


export default function Search(params) {

    const navigateTo = useNavigate();
    let [account, setAccount] = useState();
    let [isPass, setIsPass] = useState(false);
    let [isLoading, setIsLoading] = useState();
    const { isSuccess: addrSuccess, refetch: getAddr } = usePrepareSendTransaction({
        request: {
          to: account,
          value: ethers.utils.parseEther('0'),
        },
        enabled: false
    })

    const { data, isSuccess: ensSuccess, refetch: getEns } = useEnsAddress({
        name: account,
        enabled: false
    })

    const changeAccount = (v) => {
        account = v;
        setAccount(account);
    }

    const verify = async() => {
        setIsLoading(true);
        await getAddr();
        await getEns();
        setTimeout(() => {
            if (!isPass) {
                setIsLoading(false);
                message.error('请输入正确的地址')
            }else{
                console.log(data);
                navigateTo(`/${data}`)
            }
        }, 1000);
    }

    useEffect(() => {
        if (addrSuccess || ensSuccess) {
            setIsPass(true);
        }
    },[addrSuccess, ensSuccess])

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
                    <Button onClick={verify} loading={isLoading}>Get started</Button>
                </div>
            </div>
        </div>
    )
}