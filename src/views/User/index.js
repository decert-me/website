import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import {
    EditOutlined,
    CopyOutlined
} from '@ant-design/icons';
import { Button, message, Skeleton } from "antd";
import "@/assets/styles/view-style/user.scss"
import { getUser } from "@/request/api/public";
import { NickName } from "@/utils/NickName";
import { hashAvatar } from "@/utils/HashAvatar";


export default function User(props) {
    
    const location = useLocation();
    const { address } = useAccount();
    let [account, setAccount] = useState();
    let [isMe, setIsMe] = useState();
    let [info, setInfo] = useState();
    let [list, setList] = useState([]);

    const copy = (text) => {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        message.success("复制成功")
    }

    const getInfo = async() => {
        const user = await getUser({address: account})
        console.log(user.data);
        info = {
            nickname: user.data?.nickname ? user.data.nickname : NickName(account),
            address: account,
            description: user.data?.description ? user.data.description : "暂无介绍",
            avatar: user.data?.avatar ? process.env.REACT_APP_BASE_URL + user.data.avatar : hashAvatar(account)
        }
        setTimeout(() => {
            
            setInfo({...info})
        }, 1000);
    }

    const init = () => {
        account = location?.pathname?.split("/").slice(-1)[0];
        setAccount(account);
        setIsMe(address === account);
        getInfo();
    }

    useEffect(() => {
        init();
    }, [location]);

    return (
        <div className="User">
            <div className="User-info">
                {
                    info ? 
                    <>
                    <div className="img">
                        <img src={info.avatar} alt="" />
                    </div>
                    <div className="info">
                        <p className="name">
                            {info.nickname ? info.nickname : NickName(info.address)}
                        </p>
                        <p className="address" onClick={() => copy(info.address)}>
                            {NickName(info.address)}<CopyOutlined style={{color: "#9E9E9E", marginLeft: "12px"}} />
                        </p>
                        <div className="social">
                            <div className="icon"></div>
                        </div>
                        <div className="desc">
                            {info.description}
                        </div>
                    </div>
                    {
                        isMe &&
                        <Link to={`/user/edit/${address}`}>
                            <Button className="btn">
                                <EditOutlined style={{fontSize: "18px"}} />
                                编辑资料
                            </Button>
                        </Link>
                    }
                    </>
                    :
                    <Skeleton
                        active
                        avatar
                        paragraph={{
                        rows: 4,
                        }}
                    />
                }
                
            </div>
            <div className="User-list">
                <ul className="challenge">
                    <li className="active">完成的挑战</li>
                    <li>发布的挑战</li>
                </ul>
                <ul className="status">
                    <li className="active">全部</li>
                    <li>可领取</li>
                    <li>已领取</li>
                </ul>
            </div>
            <div className="User-content">
                
            </div>
        </div>
    )
}