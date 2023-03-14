import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import {
    EditOutlined,
    CopyOutlined
} from '@ant-design/icons';
import { Button, message, Skeleton } from "antd";
import "@/assets/styles/view-style/user.scss"
import { getChallengeComplete, getChallengeCreate, getUser } from "@/request/api/public";
import { NickName } from "@/utils/NickName";
import { hashAvatar } from "@/utils/HashAvatar";
import ChallengeItem from "@/components/User/ChallengeItem";
import Pagination from "@/components/User/Pagination";


export default function User(props) {
    
    const location = useLocation();
    const { address } = useAccount();
    let [account, setAccount] = useState();
    let [isMe, setIsMe] = useState();
    let [info, setInfo] = useState();
    let [list, setList] = useState([]);

    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 10, total: null
    });
    let [checkType, setCheckType] = useState(0);
    let [checkStatus, setCheckStatus] = useState(0);

    let [type, setType] = useState([
        { key: 'complete', label: "完成的挑战", children: [
            { key: 0, label: "全部" },
            { key: 1, label: "可领取" },
            { key: 2, label: "已领取" }
        ]},
        { key: 'publish', label: "发布的挑战", children: [
            { key: 0, label: "全部"}
        ]}
    ])

    const copy = (text) => {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        message.success("复制成功")
    }

    const getList = () => {
        if (checkType === 0) {
            // 'complete'
            getChallengeComplete({
                ...pageConfig,
                type: checkStatus,
                address: account
            })
            .then(res => {
                if (res?.data) {
                    list = res.data.list ? res.data.list : [];
                    setList([...list]);
                    pageConfig.total = res.data.total;
                    setPageConfig({...pageConfig});
                }
            })
        }else{
            // 'publish'
            getChallengeCreate({
                ...pageConfig,
                address: account
            })
            .then(res => {
                if (res?.data) {
                    list = res.data.list ? res.data.list : [];
                    setList([...list]);
                    pageConfig.total = res.data.total;
                    setPageConfig({...pageConfig});
                }
            })
        }
    }

    const toggleType = (key) => {
        checkType = key;
        setCheckType(checkType);
        checkStatus = 0;
        setCheckStatus(checkStatus);
        pageConfig.page = 1;
        setPageConfig({...pageConfig});
    }

    const toggleStatus = (key) => {
        checkStatus = key;
        setCheckStatus(checkStatus);
    }

    const togglePage = (page) => {
        pageConfig.page = page;
        setPageConfig({...pageConfig});
        getList();
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
        if (account !== address) {
            type[0].children = [
                { key: 0, label: "全部" },
            ];
            setType([...type]);
        }
    }

    useEffect(() => {
        init();
    }, [location]);

    useEffect(() => {
        getList();
    },[checkStatus, checkType])

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
                    {
                        type.map((e,i) => 
                            <li 
                                key={e.key} 
                                className={checkType === i ? "active" : ""}
                                onClick={() => toggleType(i)}
                            >
                                {e.label}
                            </li>
                        )
                    }
                </ul>
                <ul className="status">
                    {
                        type[checkType].children.map((e,i) => 
                            <li 
                                key={e.key} 
                                className={checkStatus === i ? "active" : ""}
                                onClick={() => toggleStatus(e.key)}
                            >
                                {e.label}
                            </li>
                        )
                    }
                </ul>
            </div>
            <div className="User-content">
                {
                    list.map(e => 
                        <ChallengeItem 
                            key={e.id} 
                            info={e}
                        />
                    )
                }
                <Pagination pageConfig={pageConfig} togglePage={togglePage} />
            </div>
        </div>
    )
}