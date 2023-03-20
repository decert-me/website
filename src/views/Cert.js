import { Divider, Input } from "antd";
import {
    SearchOutlined
} from "@ant-design/icons"
import { hashAvatar } from "@/utils/HashAvatar";
import { useState } from "react";


export default function Cert(params) {
    
    let [account, setAccount] = useState('');

    return (
        <div className="Cert">
            <div className="Cert-sidbar">
                <div className="search">
                    <p className="search-title">
                        搜索
                    </p>
                    <Input addonBefore={<SearchOutlined />} />
                </div>
                <Divider />
                <div className="user">
                    <div className="avatar">
                        <div className="img">
                            {/* <img src={hashAvatar(account)} alt="" /> */}
                        </div>
                    </div>
                </div>
                <Divider />
                <div className="nfts">

                </div>
            </div>
            <div className="Cert-content">

            </div>
        </div>
    )
}