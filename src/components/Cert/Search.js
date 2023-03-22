import {
    SearchOutlined
} from "@ant-design/icons"
import { useRequest, useUpdateEffect } from "ahooks";
import { Input } from "antd";
import { ethers } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnsAddress } from "wagmi";

export default function CertSearch(props) {

    const navigateTo = useNavigate();
    let [account, setAccount] = useState();

    const { data, isSuccess, refetch } = useEnsAddress({
        name: account,
        enabled: false
    })

    const changeAccount = (v) => {
        setAccount(v);
    }

    const { runAsync: debounce } = useRequest(changeAccount, {
        debounceWait: 300,
        manual: true
    });

    const getData = async() => {
        await refetch();
        if (data) {
            navigateTo(`/${data}`);
        }else{
            navigateTo(`/${ethers.constants.AddressZero}`);
        }
    }

    useUpdateEffect(() => {
        getData()
    },[account])

    return (
        <div className="search">
            <p className="search-title">
                搜索
            </p>
            <div className="search-inner">
                <SearchOutlined className="icon" />
                <Input bordered={false} onChange={(e) => debounce(e.target.value)} />
            </div>
        </div>
    )
}